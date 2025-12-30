import { supabase } from './supabase';
import type { SubjectGrade, PsychometricScores } from '../utils/calculator';

interface UserData {
    bagrut: SubjectGrade[];
    psychometric: PsychometricScores;
    preferences?: { institution: string; degree: string };
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
                // query returns array instead of .single() to avoid crashing on duplicates
                const { data: existingRows } = await supabase
                    .from('user_calculations')
                    .select('id')
                    .eq('user_id', session.user.id);

                if (existingRows && existingRows.length > 0) {
                    // Update the first found record
                    await supabase
                        .from('user_calculations')
                        .update({
                            bagrut_data: data.bagrut,
                            psychometric_data: data.psychometric,
                            preferences: data.preferences,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingRows[0].id);

                    // Optional: We could delete duplicates here, but better to do it via SQL migration
                } else {
                    // Insert new record
                    await supabase
                        .from('user_calculations')
                        .insert({
                            user_id: session.user.id,
                            bagrut_data: data.bagrut,
                            psychometric_data: data.psychometric,
                            preferences: data.preferences
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
            return JSON.parse(local);
        }
    } catch (e) { /* ignore */ }

    // 2. Try Supabase (if logged in)
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data } = await supabase
                .from('user_calculations')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (data) {
                return {
                    bagrut: data.bagrut_data,
                    psychometric: data.psychometric_data,
                    preferences: data.preferences
                };
            }
        }
    } catch (e) { /* ignore */ }

    return null;
};
