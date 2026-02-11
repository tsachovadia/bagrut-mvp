import type { TelegramMessage } from '../types.js';
import { sendMessage, deleteMessage } from '../client.js';
import { supabase } from '../middleware.js';

// Simple spam patterns
const SPAM_PATTERNS = [
    /https?:\/\/t\.me\/(?!MitlabtimBot)/i,  // Telegram links to other bots/groups
    /https?:\/\/bit\.ly/i,
    /https?:\/\/wa\.me/i,
    /earn money|הרוויחו כסף|עבודה מהבית|קזינו|casino/i,
];

/**
 * Handle messages in managed groups
 */
export async function handleGroupMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const from = message.from;

    if (!from) return;

    // Check if this is a managed group
    const { data: group } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('telegram_group_id', chatId)
        .single();

    if (!group) return; // Not a managed group

    // Auto-moderation
    if (group.auto_moderate && isSpam(text)) {
        try {
            await deleteMessage(chatId, message.message_id);
            await sendMessage(chatId,
                `⚠️ ${from.first_name || 'משתמש'}, ההודעה הוסרה (ספאם).`
            );
        } catch {
            // Bot might not have admin permissions
        }
        return;
    }

    // Track group activity (lightweight - don't log every message)
    // Just update member count periodically
}

/**
 * Handle new member joining a managed group
 */
export async function handleNewMember(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id.toString();
    const newMembers = message.new_chat_members || [];

    // Check if this is a managed group
    const { data: group } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('telegram_group_id', chatId)
        .single();

    if (!group) return;

    for (const member of newMembers) {
        if (member.is_bot) continue;

        // Send welcome message
        await sendMessage(chatId,
            `👋 ברוכים הבאים ${member.first_name || ''}!\n\n` +
            `כדי לבדוק את סיכויי הקבלה שלך, שלח הודעה ל-@MitlabtimBot`
        );

        // Try to link to existing bot user
        const { data: botUser } = await supabase
            .from('bot_users')
            .select('id, rooms_joined')
            .eq('telegram_chat_id', member.id.toString())
            .single();

        if (botUser) {
            const currentRooms = botUser.rooms_joined || [];
            if (!currentRooms.includes(chatId)) {
                await supabase
                    .from('bot_users')
                    .update({ rooms_joined: [...currentRooms, chatId] })
                    .eq('id', botUser.id);
            }
        }

        // Increment group member count
        await supabase
            .from('bot_groups')
            .update({ member_count: (group.member_count || 0) + 1 })
            .eq('id', group.id);
    }
}

function isSpam(text: string): boolean {
    return SPAM_PATTERNS.some(pattern => pattern.test(text));
}
