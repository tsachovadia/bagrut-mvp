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
    trackedPrograms?: string[];
}

const LOCAL_STORAGE_KEY = 'bagrut_plus_data';


let saveTimeout: NodeJS.Timeout | null = null;
let pendingSaveData: UserData | null = null;

async function syncToSupabase(data: UserData) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .maybeSingle();

            const dbPayload = {
                user_id: session.user.id,
                bagrut_grades: data.bagrut as any,
                saved_simulations: data.savedSimulations as any,
                psycho_score_total: data.psychometric.total,
                psycho_score_eng: data.psychometric.english,
                psycho_score_quant: data.psychometric.quantitative,
                institution_pref: data.preferences.institutions,
                major_subjects: data.preferences.fields,
                tracked_programs: data.trackedPrograms || [],
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
                        email_primary: session.user.email,
                        first_name: 'משתמש חדש'
                    });
            }
        }
    } catch (e) {
        console.error('[userData] Failed to sync to Supabase:', e);
    }
}

// Flush any pending debounced save immediately (call on page unload)
export const flushPendingSave = () => {
    if (saveTimeout && pendingSaveData) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
        syncToSupabase(pendingSaveData);
        pendingSaveData = null;
    }
};

// Register beforeunload to prevent data loss on page close
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flushPendingSave);
}

export const saveUserData = async (data: UserData) => {
    // 1. Save to Local Storage (immediate)
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('[userData] Failed to save to localStorage:', e);
    }

    // 2. Save to Supabase (debounced)
    pendingSaveData = data;
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
        if (pendingSaveData) {
            await syncToSupabase(pendingSaveData);
            pendingSaveData = null;
        }
        saveTimeout = null;
    }, 1000);
};

export const loadUserData = async (): Promise<UserData | null> => {
    // 1. Try Local Storage
    let localData: UserData | null = null;
    try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
            const data = JSON.parse(local);
            if (data.preferences && !Array.isArray(data.preferences.fields)) {
                data.preferences = { fields: [], institutions: [], isUndecided: false };
            }
            if (!data.savedSimulations) {
                data.savedSimulations = [];
            }
            localData = data;
        }
    } catch (e) {
        console.error('[userData] Failed to parse localStorage data:', e);
    }

    if (localData && !navigator.onLine) {
        return localData;
    }

    // 2. Try Supabase (if logged in) or Sync Local->Cloud
    try {
        const { data: { session } } = await supabase.auth.getSession();

        // SYNC: If we have local data and a user, force a save to ensure cloud is in sync
        // Guard against infinite loops: only sync once per session load
        const hasSynced = sessionStorage.getItem('has_synced_data');
        if (localData && session?.user && !hasSynced) {
            console.log('Syncing local data to cloud profile...');
            sessionStorage.setItem('has_synced_data', 'true');
            saveUserData(localData);
            return localData;
        }

        if (session?.user) {
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (data) {
                // Map from user_profiles back to UserData structure
                const bagrutData = (data.bagrut_grades as any) || [];
                const savedSims = (data.saved_simulations as any) || [];

                const psychometric = {
                    general: data.psycho_score_total || 0,
                    total: data.psycho_score_total || 0,
                    english: data.psycho_score_eng || 0,
                    quantitative: data.psycho_score_quant || 0,
                    verbal: 0
                };

                const preferences: UserPreferences = {
                    fields: data.major_subjects || [],
                    institutions: data.institution_pref || [],
                    isUndecided: false
                };

                // CRITICAL FAILOVER: If Cloud data is empty (no bagrut) but we have Local data,
                // assume the Cloud is stale/empty and PREFER LOCAL to avoid "No Data" screen.
                if (bagrutData.length === 0 && localData && localData.bagrut.length > 0) {
                    console.warn('[loadUserData] Cloud profile found but has NO GRADES. Local data HAS GRADES. Preferring Local & Re-Syncing.');
                    saveUserData(localData); // Force update cloud with local
                    return localData;
                }

                console.log('[loadUserData] UserData loaded from Supabase session', { bagrutCount: bagrutData.length });
                return {
                    bagrut: bagrutData,
                    psychometric: psychometric,
                    preferences: preferences,
                    sector: undefined,
                    savedSimulations: savedSims,
                    trackedPrograms: (data.tracked_programs as string[]) || []
                };
            }
        }
    } catch (e) {
        console.error('[userData] Failed to load from Supabase:', e);
    }

    // Fallback or default return
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
