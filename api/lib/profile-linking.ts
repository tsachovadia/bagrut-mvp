import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Link a source identity to a canonical profile.
 */
export async function linkProfiles(
    canonicalId: string,
    sourceType: 'web' | 'telegram' | 'soft_lead' | 'facebook_lead',
    sourceId: string,
    confidence: number = 1.0,
    linkedBy: string = 'system'
): Promise<void> {
    const { error } = await supabase
        .from('profile_links')
        .upsert({
            canonical_id: canonicalId,
            source_type: sourceType,
            source_id: sourceId,
            confidence,
            linked_by: linkedBy,
        }, { onConflict: 'source_type,source_id' });

    if (error) {
        console.error('Error linking profiles:', error);
    }
}

/**
 * Find a canonical profile by phone number match.
 */
export async function findMatchByPhone(phone: string): Promise<string | null> {
    // Normalize phone: remove spaces, dashes, leading +972 → 0
    const normalized = phone
        .replace(/[\s\-()]/g, '')
        .replace(/^\+972/, '0');

    const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .or(`phone_primary.eq.${normalized},phone_primary.eq.+972${normalized.slice(1)}`)
        .limit(1)
        .single();

    return data?.id || null;
}

/**
 * Find a canonical profile by email match.
 */
export async function findMatchByEmail(email: string): Promise<string | null> {
    if (!email) return null;

    const { data } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email_primary', email.toLowerCase().trim())
        .limit(1)
        .single();

    return data?.id || null;
}

/**
 * Try to auto-link a soft lead to an existing profile via phone or email.
 */
export async function autoLinkSoftLead(softLeadId: string): Promise<string | null> {
    const { data: lead } = await supabase
        .from('soft_leads')
        .select('id, phone, email')
        .eq('id', softLeadId)
        .single();

    if (!lead) return null;

    // Try phone match first
    let canonicalId = lead.phone ? await findMatchByPhone(lead.phone) : null;

    // Fallback to email
    if (!canonicalId && lead.email) {
        canonicalId = await findMatchByEmail(lead.email);
    }

    if (canonicalId) {
        // Link the soft lead
        await linkProfiles(canonicalId, 'soft_lead', softLeadId, 0.8);

        // Update soft_leads table with the link
        await supabase
            .from('soft_leads')
            .update({ user_profile_id: canonicalId })
            .eq('id', softLeadId);
    }

    return canonicalId;
}

/**
 * Link a bot user to a web profile (called from /start link_{userId}).
 */
export async function linkBotToWeb(botUserId: string, webUserId: string): Promise<void> {
    await linkProfiles(webUserId, 'web', webUserId, 1.0, 'user_action');
    await linkProfiles(webUserId, 'telegram', botUserId, 1.0, 'user_action');
}
