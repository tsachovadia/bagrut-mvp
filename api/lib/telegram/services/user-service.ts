import type { BotUser, ConversationState } from '../types';
import { supabase, updateBotUser } from '../middleware';

/**
 * Set conversation state and optional state data
 */
export async function setState(
    userId: string,
    state: ConversationState,
    stateData: Record<string, any> = {}
): Promise<void> {
    await updateBotUser(userId, {
        conversation_state: state,
        state_data: stateData,
    } as Partial<BotUser>);
}

/**
 * Clear conversation state back to idle
 */
export async function clearState(userId: string): Promise<void> {
    await setState(userId, 'idle', {});
}

/**
 * Get all active (non-blocked) bot users matching a filter
 */
export async function getUsersByFilter(filter: {
    lead_stage?: string;
    drip_stage?: string;
    sector?: string;
    has_grades?: boolean;
}): Promise<BotUser[]> {
    let query = supabase
        .from('bot_users')
        .select('*')
        .eq('is_blocked', false);

    if (filter.lead_stage) query = query.eq('lead_stage', filter.lead_stage);
    if (filter.drip_stage) query = query.eq('drip_stage', filter.drip_stage);
    if (filter.sector) query = query.eq('sector', filter.sector);
    if (filter.has_grades) query = query.not('grades', 'eq', '[]');

    const { data } = await query;
    return (data || []) as BotUser[];
}

/**
 * Get user by referral code
 */
export async function getUserByReferralCode(code: string): Promise<BotUser | null> {
    const { data } = await supabase
        .from('bot_users')
        .select('*')
        .eq('referral_code', code)
        .single();

    return data as BotUser | null;
}

/**
 * Increment referral count for a user
 */
export async function incrementReferralCount(userId: string): Promise<void> {
    const { data: user } = await supabase
        .from('bot_users')
        .select('referral_count')
        .eq('id', userId)
        .single();

    if (user) {
        await supabase
            .from('bot_users')
            .update({ referral_count: (user.referral_count || 0) + 1 })
            .eq('id', userId);
    }
}

/**
 * Get all managed groups
 */
export async function getActiveGroups(): Promise<any[]> {
    const { data } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('is_active', true);

    return data || [];
}
