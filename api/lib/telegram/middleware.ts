import { createClient } from '@supabase/supabase-js';
import type { VercelRequest } from '@vercel/node';
import type { BotUser, TelegramUpdate, ConversationState, PsychometricBot } from './types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify that the webhook request comes from Telegram
 */
export function verifyWebhook(req: VercelRequest): boolean {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) return true; // If no secret configured, allow (dev mode)
    const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
    return headerSecret === secret;
}

/**
 * Generate a unique referral code from chat ID
 */
function generateReferralCode(chatId: string): string {
    // Simple hash-based code: base36 of a numeric derivation
    const num = BigInt(chatId) * BigInt(31) + BigInt(7919);
    return num.toString(36).slice(0, 8).toUpperCase();
}

/**
 * Find or create a bot_users row for this Telegram user
 */
export async function resolveUser(update: TelegramUpdate): Promise<BotUser> {
    const from = update.message?.from || update.callback_query?.from;
    if (!from) throw new Error('No user in update');

    const chatId = (update.message?.chat?.id || update.callback_query?.message?.chat?.id)?.toString();
    if (!chatId) throw new Error('No chat ID in update');

    // Try to find existing user
    const { data: existing } = await supabase
        .from('bot_users')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .single();

    if (existing) {
        return existing as BotUser;
    }

    // Create new user
    const referralCode = generateReferralCode(chatId);
    const newUser: Partial<BotUser> = {
        telegram_chat_id: chatId,
        telegram_username: from.username || null,
        first_name: from.first_name || null,
        last_name: from.last_name || null,
        conversation_state: 'idle' as ConversationState,
        state_data: {},
        sector: null,
        grades: [],
        psychometric: { general: 0, quantitative: 0, verbal: 0, english: 0 } as PsychometricBot,
        tracked_programs: [],
        lead_score: 0,
        lead_stage: 'new',
        web_user_id: null,
        referral_code: referralCode,
        referred_by: null,
        referral_count: 0,
        rooms_joined: [],
        drip_stage: 'welcome',
        drip_last_sent_at: null,
        source: 'organic',
        deep_link_program_id: null,
        message_count: 0,
        commands_used: [],
        is_blocked: false,
        consent_marketing: false,
        consent_given_at: null,
        metadata: {},
    };

    const { data: created, error } = await supabase
        .from('bot_users')
        .insert(newUser)
        .select()
        .single();

    if (error) {
        console.error('Error creating bot user:', error);
        throw error;
    }

    return created as BotUser;
}

/**
 * Update user's last_active_at and message_count
 */
export async function touchUser(userId: string): Promise<void> {
    await supabase
        .from('bot_users')
        .update({
            last_active_at: new Date().toISOString(),
        })
        .eq('id', userId);
}

/**
 * Update bot user fields
 */
export async function updateBotUser(userId: string, updates: Partial<BotUser>): Promise<void> {
    const { error } = await supabase
        .from('bot_users')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating bot user:', error);
    }
}

/**
 * Log a message for analytics
 */
export async function logMessage(
    botUserId: string,
    direction: 'incoming' | 'outgoing',
    messageType: string,
    content?: string,
    extra?: { callback_data?: string; campaign_id?: string; variant?: string }
): Promise<void> {
    await supabase.from('bot_messages_log').insert({
        bot_user_id: botUserId,
        direction,
        message_type: messageType,
        content: content?.substring(0, 500), // Truncate for storage
        callback_data: extra?.callback_data,
        campaign_id: extra?.campaign_id,
        variant: extra?.variant,
    });
}

/**
 * Mark user as blocked (when Telegram returns 403)
 */
export async function markUserBlocked(chatId: string): Promise<void> {
    await supabase
        .from('bot_users')
        .update({ is_blocked: true })
        .eq('telegram_chat_id', chatId);
}
