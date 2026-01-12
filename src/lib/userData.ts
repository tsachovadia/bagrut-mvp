import { supabase } from './supabase';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';

interface UserPreferences {
    fields: string[];
    institutions: string[];
    isUndecided: boolean;
}

export interface SavedSimulation {
    id: string;
    name: string;
    createdAt: number;
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
}

export interface UserData {
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
    preferences: UserPreferences;
    sector?: string; // Persist sector choice
    savedSimulations?: SavedSimulation[];
}

const LOCAL_STORAGE_KEY = 'bagrut_plus_data';


let saveTimeout: NodeJS.Timeout | null = null;

export const saveUserData = async (data: UserData) => {
    // 1. Save to Local Storage (immediate)
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to localStorage', e);
    }

    // 2. Save to Supabase (debounced)
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Check if we have existing record(s) for this user
                const { data: existingProfile } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                const dbPayload = {
                    user_id: session.user.id,
                    bagrut_grades: data.bagrut as any, // Cast to any for JSONB compatibility
                    saved_simulations: data.savedSimulations as any, // Cast to any for JSONB compatibility
                    // Map Psychometric
                    psycho_score_total: data.psychometric.total,
                    psycho_score_eng: data.psychometric.english,
                    psycho_score_quant: data.psychometric.quantitative,
                    // Map Preferences
                    institution_pref: data.preferences.institutions,
                    major_subjects: data.preferences.fields,
                    updated_at: new Date().toISOString()
                };

                if (existingProfile) {
                    await supabase
                        .from('user_profiles')
                        .update(dbPayload)
                        .eq('id', existingProfile.id);
                } else {
                    await supabase
                        .from('user_profiles')
                        .insert({
                            ...dbPayload,
                            // Set defaults for new profile if needed
                            email_primary: session.user.email,
                            first_name: 'משתמש חדש' // Placeholder
                        });
                }
            }
        } catch (e) {
            console.error('Failed to sync to Supabase', e);
        }
    }, 1000); // 1 second debounce
};

export const loadUserData = async (): Promise<UserData | null> => {
    // 1. Try Local Storage
    try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
            const data = JSON.parse(local);
            // Simple migration check: if preferences exists but lacks 'fields', reset it
            if (data.preferences && !Array.isArray(data.preferences.fields)) {
                data.preferences = { fields: [], institutions: [], isUndecided: false };
            }
            // Ensure savedSimulations is an array
            if (!data.savedSimulations) {
                data.savedSimulations = [];
            }
            return data;
        }
    } catch (e) { /* ignore */ }

    // 2. Try Supabase (if logged in)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (data) {
                // Map from user_profiles back to UserData structure
                // Use type assertion as JSONB is returned as generic Json
                const bagrutData = (data.bagrut_grades as any) || [];
                const savedSims = (data.saved_simulations as any) || [];

                // Construct psychometric object
                // Construct psychometric object
                const psychometric = {
                    general: data.psycho_score_total || 0, // General score is the main one
                    total: data.psycho_score_total || 0,
                    english: data.psycho_score_eng || 0,
                    quantitative: data.psycho_score_quant || 0,
                    verbal: 0 // Not stored in schema currently, default to 0
                };

                // Construct preferences
                const preferences: UserPreferences = {
                    fields: data.major_subjects || [],
                    institutions: data.institution_pref || [],
                    isUndecided: false // Default/Not persisted explicitly
                };

                console.log('UserData loaded from Supabase session');
                return {
                    bagrut: bagrutData,
                    psychometric: psychometric,
                    preferences: preferences,
                    sector: undefined, // Sector not in user_profiles explicitly (maybe via school?)
                    savedSimulations: savedSims
                };
            }
        }
    } catch (e) { /* ignore */ }

    return null;
};

export const clearAllUserData = async () => {
    // 1. Clear Local Storage
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem('lead_captured');
        localStorage.removeItem('has_seen_welcome_v2');
    } catch (e) { /* ignore */ }

    // 2. Sign out from Supabase
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error('Failed to sign out', e);
    }
};
