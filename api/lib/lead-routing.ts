import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Types ---

export type ClientType =
    | 'university_registration'  // Has grades, comparing programs, meets some thresholds
    | 'psychometric_prep'        // Low/no psychometric, intends to improve
    | 'bagrut_improvement'       // Specific subject gaps or low average
    | 'pre_academic_mechina'     // Low overall profile, needs pre-academic program
    | 'scholarship'              // Needs financial aid
    | 'general_counseling';      // Undecided, needs guidance

interface ProfileData {
    bagrut_avg?: number | null;
    psycho_total?: number | null;
    psycho_quant?: number | null;
    psycho_eng?: number | null;
    gap_analysis?: any;
    lead_score?: number | null;
    field_preferences?: string[] | null;
    tracked_programs?: string[] | null;
    scholarship_needed?: boolean | null;
    journey_stage?: string | null;
    lead_stage?: string | null;
}

// --- Routing Logic ---

/**
 * Compute which client types this student is relevant for.
 * Each student can match multiple types (that's the monetization magic).
 */
export function computeRoutingTags(profile: ProfileData): ClientType[] {
    const tags: ClientType[] = [];

    const hasGrades = (profile.bagrut_avg || 0) > 0;
    const hasPsychometric = (profile.psycho_total || 0) > 0;
    const hasTrackedPrograms = (profile.tracked_programs?.length || 0) > 0;
    const isEngaged = (profile.lead_score || 0) >= 20;

    // University registration: has grades + tracking programs + engaged
    if (hasGrades && hasTrackedPrograms && isEngaged) {
        tags.push('university_registration');
    }

    // Psychometric prep: no psychometric OR low score OR gap analysis shows psychometric gaps
    if (!hasPsychometric && hasGrades) {
        tags.push('psychometric_prep');
    } else if (hasPsychometric && (profile.psycho_total || 0) < 600) {
        tags.push('psychometric_prep');
    } else if (hasGapsOfType(profile.gap_analysis, 'psychometric')) {
        tags.push('psychometric_prep');
    }

    // Bagrut improvement: low average OR specific subject gaps
    if (hasGrades && (profile.bagrut_avg || 0) < 85) {
        tags.push('bagrut_improvement');
    } else if (hasGapsOfType(profile.gap_analysis, 'bagrut_subject')) {
        tags.push('bagrut_improvement');
    }

    // Pre-academic mechina: low grades + low/no psychometric
    if (hasGrades && (profile.bagrut_avg || 0) < 75 && (!hasPsychometric || (profile.psycho_total || 0) < 550)) {
        tags.push('pre_academic_mechina');
    }

    // Scholarship: explicitly needs it
    if (profile.scholarship_needed) {
        tags.push('scholarship');
    }

    // General counseling: undecided or no preferences
    if (!hasTrackedPrograms && (!profile.field_preferences || profile.field_preferences.length === 0)) {
        tags.push('general_counseling');
    }

    return tags;
}

/**
 * Check if gap analysis contains gaps of a specific type.
 */
function hasGapsOfType(gapAnalysis: any, gapType: string): boolean {
    if (!gapAnalysis || !Array.isArray(gapAnalysis)) return false;

    return gapAnalysis.some((program: any) =>
        program.gaps?.some((gap: any) =>
            gap.type === gapType || gap.type?.startsWith(gapType)
        )
    );
}

/**
 * Compute temperature based on engagement signals.
 */
export function computeTemperature(
    leadScore: number,
    lastActiveAt: string | null,
    messageCount: number
): 'cold' | 'warm' | 'hot' {
    const daysSinceActive = lastActiveAt
        ? (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
        : 999;

    if (leadScore >= 60 && daysSinceActive < 3) return 'hot';
    if (leadScore >= 30 && daysSinceActive < 7) return 'warm';
    if (leadScore >= 10 && daysSinceActive < 14 && messageCount > 3) return 'warm';
    return 'cold';
}

/**
 * Compute journey stage based on profile completeness.
 */
export function computeJourneyStage(profile: ProfileData): string {
    const hasGrades = (profile.bagrut_avg || 0) > 0;
    const hasPsychometric = (profile.psycho_total || 0) > 0;
    const hasTracked = (profile.tracked_programs?.length || 0) > 0;
    const hasPreferences = (profile.field_preferences?.length || 0) > 0;

    if (hasTracked && hasGrades && hasPsychometric) return 'deciding';
    if (hasGrades && (hasPreferences || hasPsychometric)) return 'comparing';
    if (hasGrades || hasPsychometric) return 'exploring';
    return 'anonymous';
}

/**
 * Compute and store routing tags, temperature, and journey stage for a user.
 */
export async function updateUserRouting(userId: string): Promise<ClientType[]> {
    // Fetch current profile data
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('bagrut_avg_raw, psycho_score_total, psycho_score_quant, psycho_score_eng, gap_analysis, lead_score, major_subjects, tracked_programs, scholarship_needed, journey_stage, lead_stage, app_last_active')
        .eq('id', userId)
        .single();

    if (!profile) return [];

    const profileData: ProfileData = {
        bagrut_avg: profile.bagrut_avg_raw,
        psycho_total: profile.psycho_score_total,
        psycho_quant: profile.psycho_score_quant,
        psycho_eng: profile.psycho_score_eng,
        gap_analysis: profile.gap_analysis,
        lead_score: profile.lead_score,
        field_preferences: profile.major_subjects,
        tracked_programs: profile.tracked_programs,
        scholarship_needed: profile.scholarship_needed,
        journey_stage: profile.journey_stage,
        lead_stage: profile.lead_stage,
    };

    const tags = computeRoutingTags(profileData);
    const journeyStage = computeJourneyStage(profileData);
    const temperature = computeTemperature(
        profile.lead_score || 0,
        profile.app_last_active,
        0 // web doesn't track message_count
    );

    await supabase
        .from('user_profiles')
        .update({
            lead_routing_tags: tags,
            journey_stage: journeyStage,
            temperature: temperature,
        })
        .eq('id', userId);

    return tags;
}
