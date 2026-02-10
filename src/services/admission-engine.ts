import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// --- Types matching our DB Schema ---
export interface University {
    id: string;
    name: string;
    key: string;
    calculator_type: string;
    website_url?: string;
}

export interface Program {
    id: string;
    name: string;
    degree_type: string;
    duration_years: number;
    description?: string;
    career_opportunities?: string;
    website_url?: string;
    faculty_id?: string;
    // Joined structured data
    faculties?: {
        id: string;
        name: string;
        institution_id: string;
        institutions: {
            id: string;
            name: string;
            type: string;
            logo_url: string;
            website_url: string;
        }
    };
    admission_rules?: AdmissionRule[];
}

export interface AdmissionRule {
    id: string;
    year: number;
    status: string;
    min_score?: number;
    max_score?: number;
    logic_operator?: string;
    raw_json?: any;
    logic_config?: any; // Added to match DB
    logic_rules?: any;  // Added for UI mapping
}

export interface ExamEvent {
    exam_type: string;
    season: string;
    exam_date: string;
    subject?: string;
}

// --- Service ---
export class AdmissionEngine {
    private supabase;

    constructor() {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async getAllUniversities(): Promise<University[]> {
        const { data, error } = await this.supabase
            .from('universities')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching universities:', error);
            return [];
        }
        return data || [];
    }

    /**
     * @deprecated Use getAllProgramsFull for correct hierarchy
     */
    async getProgramsForUniversity(uniId: string): Promise<Program[]> {
        // This likely won't work well with new schema, returning empty allowed
        const { data, error } = await this.supabase
            .from('programs')
            .select(`
                *,
                admission_rules (*)
            `)
            .eq('university_id', uniId); // This column likely doesn't exist anymore

        if (error) {
            // Non-breaking return
            return [];
        }
        return data || [];
    }

    async getAllProgramsFull(): Promise<Program[]> {
        const { data, error } = await this.supabase
            .from('programs')
            .select(`
                *,
                admission_rules (*),
                faculties (
                    id,
                    name,
                    university_id,
                    universities (
                        id,
                        name,
                        type,
                        logo_url,
                        website_url
                    )
                )
            `)
            .limit(1000); // Increased limit for multiple universities

        if (error) {
            console.error('Error fetching full programs:', error);
            return [];
        }
        return (data as any[]) || [];
    }

    // Helper to map DB shape to UI shape expected by ProgramsExplorer
    mapProgramToUI(p: Program) {
        const faculty = p.faculties as any;
        const institution = faculty?.universities;
        const rawRule = p.admission_rules?.[0];

        // Map DB rule to UI rule, handling column name differences
        const admissionRule = rawRule ? {
            ...rawRule,
            // Determine status based on year (if older than current year, maybe closed?)
            // or use specific status field if exists in DB (it doesn't, so we assume open/published)
            status: rawRule.status || 'published',
            // Map logic_config (DB) to logic_rules (UI)
            logic_rules: rawRule.logic_config || rawRule.raw_json || {},
            // Ensure ID is set
            id: rawRule.id
        } : {
            id: 'mock',
            program_id: p.id,
            year: 2026,
            status: 'calculated', // Fallback
            logic_rules: {}
        };

        return {
            program: {
                id: p.id,
                name: p.name,
                degree_type: p.degree_type,
                duration_years: p.duration_years,
                description: p.description,
                career_opportunities: p.career_opportunities,
                institution: institution ? {
                    id: institution.id,
                    name: institution.name,
                    type: institution.type,
                    logo_url: institution.logo_url,
                    website_url: institution.website_url
                } : undefined,
                faculty: faculty ? {
                    id: faculty.id,
                    name: faculty.name
                } : undefined
            },
            admission: admissionRule
        };
    }

    async getExamSchedule(year: string = '2025'): Promise<ExamEvent[]> {
        const { data, error } = await this.supabase
            .from('exam_schedules')
            .select('*')
            .order('exam_date');

        if (error) {
            console.error('Error fetching schedule:', error);
            return [];
        }
        return data || [];
    }
}

export const admissionEngine = new AdmissionEngine();
