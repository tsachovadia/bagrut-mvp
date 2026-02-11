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
                    institution_id,
                    institutions (
                        id,
                        name,
                        type,
                        logo_url,
                        website_url
                    )
                )
            `)
            .limit(1000);

        if (error) {
            console.error('Error fetching full programs:', error);
            return [];
        }
        return (data as any[]) || [];
    }

    // Helper to map DB shape to UI shape expected by ProgramsExplorer
    mapProgramToUI(p: Program) {
        const faculty = p.faculties as any;

        // Handle new schema: faculty.institutions
        const institutionRaw = faculty?.institutions || faculty?.universities;

        let institution = undefined;

        if (institutionRaw) {
            // POLYFILL: Map Hebrew names to Keys & Calculator Types for logic
            // Default fallback
            let key = 'general';
            let calculator_type = 'linear_approx';

            const name = institutionRaw.name || '';

            // Logic mapping based on known seed data
            if (name.includes('הטכניון') || name.toLowerCase().includes('technion')) {
                key = 'technion';
                calculator_type = 'technion_exact';
            } else if (name.includes('תל אביב') || name.toLowerCase().includes('tel aviv')) {
                key = 'tau';
                calculator_type = 'tau_sekem';
            } else if (name.includes('בן-גוריון') || name.includes('בן גוריון') || name.toLowerCase().includes('ben gurion')) {
                key = 'bgu';
                calculator_type = 'linear_approx';
            } else if (name.includes('העברית') || name.toLowerCase().includes('hebrew')) {
                key = 'huji';
                calculator_type = 'linear_approx';
            } else if (name.includes('חיפה') || name.toLowerCase().includes('haifa')) {
                key = 'haifa';
                calculator_type = 'haifa_weighted';
            } else if (name.includes('בר אילן') || name.toLowerCase().includes('bar ilan')) {
                key = 'biu';
                calculator_type = 'linear_approx';
            } else if (name.includes('הפתוחה') || name.toLowerCase().includes('open')) {
                key = 'openu';
                calculator_type = 'afik_maavar';
            } else if (name.includes('אריאל') || name.toLowerCase().includes('ariel')) {
                key = 'ariel';
                calculator_type = 'linear_approx';
            }

            institution = {
                id: institutionRaw.id,
                name: institutionRaw.name,
                type: institutionRaw.type || 'university',
                logo_url: institutionRaw.logo_url,
                website_url: institutionRaw.website_url,
                key,
                calculator_type
            };
        }

        const rawRule = p.admission_rules?.[0];

        // Map DB rule to UI rule, handling column name differences
        const admissionRule = rawRule ? {
            ...rawRule,
            status: rawRule.status || 'published',
            logic_rules: rawRule.logic_config || rawRule.raw_json || {},
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
                website_url: p.website_url,
                institution: institution,
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
