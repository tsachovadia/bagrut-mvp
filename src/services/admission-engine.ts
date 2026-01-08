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
    is_direct_track: boolean;
    // Joined fields
    university_name?: string;
    admission_rules?: AdmissionRule[];
}

export interface AdmissionRule {
    year: number;
    min_sekem?: number;
    min_psychometric?: number;
    logic_config?: any;
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

    async getProgramsForUniversity(uniId: string): Promise<Program[]> {
        const { data, error } = await this.supabase
            .from('programs')
            .select(`
                *,
                admission_rules (*)
            `)
            .eq('university_id', uniId);

        if (error) {
            console.error('Error fetching programs:', error);
            return [];
        }
        return data || [];
    }

    async getExamSchedule(year: string = '2025'): Promise<ExamEvent[]> {
        // Simple filter for now
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
