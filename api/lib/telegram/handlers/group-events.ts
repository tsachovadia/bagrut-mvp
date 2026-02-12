import type { TelegramMessage } from '../types.js';
import { sendMessage, deleteMessage, exportChatInviteLink, getChatMemberCount } from '../client.js';
import { supabase } from '../middleware.js';

// Simple spam patterns
const SPAM_PATTERNS = [
    /https?:\/\/t\.me\/(?!MitlabtimBot)/i,  // Telegram links to other bots/groups
    /https?:\/\/bit\.ly/i,
    /https?:\/\/wa\.me/i,
    /earn money|הרוויחו כסף|עבודה מהבית|קזינו|casino/i,
];

/**
 * Handle messages in managed groups (including forum topic messages)
 */
export async function handleGroupMessage(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const from = message.from;

    if (!from) return;

    // For forum groups, look up the parent group row (forum_topic_id IS NULL)
    const { data: group } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('telegram_group_id', chatId)
        .is('forum_topic_id', null)
        .limit(1)
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
}

/**
 * Handle new member joining a managed group
 */
export async function handleNewMember(message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id.toString();
    const newMembers = message.new_chat_members || [];

    // For forum groups, look up the parent group row
    const { data: group } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('telegram_group_id', chatId)
        .is('forum_topic_id', null)
        .limit(1)
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

/**
 * Handle my_chat_member update - bot added/removed from a group
 * Auto-registers groups when the bot is added as admin.
 * Detects forum-enabled supergroups and sets is_forum=true.
 */
export async function handleMyChatMember(update: any): Promise<void> {
    const chat = update.chat;
    const newStatus = update.new_chat_member?.status;

    // Only handle groups/supergroups
    if (chat.type !== 'group' && chat.type !== 'supergroup') return;

    const chatId = chat.id.toString();
    const isForum = chat.is_forum === true;

    // Bot was added as admin or member
    if (newStatus === 'administrator' || newStatus === 'member') {
        // Check if already registered (parent row = no forum_topic_id)
        const { data: existing } = await supabase
            .from('bot_groups')
            .select('id, is_forum')
            .eq('telegram_group_id', chatId)
            .is('forum_topic_id', null)
            .single();

        if (existing) {
            // Already exists - update is_active and is_forum flag
            await supabase
                .from('bot_groups')
                .update({ is_active: true, is_forum: isForum })
                .eq('id', existing.id);
            return;
        }

        // Auto-generate invite link (only works if bot is admin)
        let inviteLink = '';
        if (newStatus === 'administrator') {
            inviteLink = await exportChatInviteLink(chatId) || '';
        }

        // Get member count
        const memberCount = await getChatMemberCount(chatId);

        // Determine group type from name
        const name = chat.title || 'קבוצה חדשה';
        let type = 'general';
        if (/CS|הנדס|מחשב|תוכנה|software|engineering/i.test(name)) type = 'field';
        else if (/20\d{2}|נרשמים|שנה/i.test(name)) type = 'stage';

        // Register the group
        await supabase.from('bot_groups').insert({
            telegram_group_id: chatId,
            name,
            type,
            invite_link: inviteLink,
            is_active: true,
            is_forum: isForum,
            auto_moderate: true,
            member_count: memberCount,
        });

        console.log(`Auto-registered ${isForum ? 'forum' : 'group'}: ${name} (${chatId})`);
    }

    // Bot was removed or banned
    if (newStatus === 'left' || newStatus === 'kicked') {
        await supabase
            .from('bot_groups')
            .update({ is_active: false })
            .eq('telegram_group_id', chatId)
            .is('forum_topic_id', null);

        console.log(`Bot removed from group: ${chatId}`);
    }
}

function isSpam(text: string): boolean {
    return SPAM_PATTERNS.some(pattern => pattern.test(text));
}
