import type { HandlerContext, InlineKeyboardButton } from '../types.js';
import { sendMessage, inlineKeyboard, btn, urlBtn, webUrl } from '../client.js';
import { logMessage, supabase } from '../middleware.js';
import { getWebProfileSummary } from './start.js';

/**
 * Handle /rooms command - show community forum with topics
 *
 * Architecture: One supergroup with Topics enabled.
 * - Parent row: is_forum=true, forum_topic_id=NULL
 * - Topic rows: is_forum=false, forum_topic_id=INT, parent_group_id=UUID
 * Users join once via the parent's invite_link and see all topics.
 */
export async function handleRooms(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    // Fetch the forum supergroup (parent)
    const { data: forumGroup } = await supabase
        .from('bot_groups')
        .select('*')
        .eq('is_forum', true)
        .eq('is_active', true)
        .limit(1)
        .single();

    // Also fetch all active topics
    const { data: allTopics } = await supabase
        .from('bot_groups')
        .select('*')
        .not('forum_topic_id', 'is', null)
        .eq('is_active', true)
        .order('name');

    const topics = allTopics || [];

    // No forum group and no standalone groups → show "coming soon"
    if (!forumGroup && topics.length === 0) {
        // Fallback: check for any active non-forum groups
        const { data: legacyGroups } = await supabase
            .from('bot_groups')
            .select('*')
            .eq('is_active', true)
            .is('forum_topic_id', null)
            .eq('is_forum', false);

        if (!legacyGroups || legacyGroups.length === 0) {
            await sendMessage(chatId,
                `👥 <b>קהילת מתלבטים</b>\n\n` +
                `הקהילה שלנו בטלגרם מחברת בין סטודנטים ומועמדים.\n` +
                `חדרי הלימוד נפתחים בקרוב!\n\n` +
                `בינתיים, בדוק את סיכויי הקבלה שלך באתר:`,
                {
                    reply_markup: inlineKeyboard([
                        [urlBtn('🌐 חשב סיכויים באתר', webUrl())],
                        [btn('📤 שתף עם חברים', 'cmd:share'), btn('📋 סטטוס', 'cmd:status')],
                        [btn('🏠 תפריט ראשי', 'cmd:start')],
                    ]),
                }
            );
            await logMessage(user.id, 'outgoing', 'rooms_empty');
            return;
        }

        // Show legacy standalone groups (backward compat)
        await showLegacyGroups(ctx, legacyGroups);
        return;
    }

    // Get user field tags for smart recommendations
    let userFieldTags: string[] = [];
    if (user.web_user_id) {
        const profile = await getWebProfileSummary(user.web_user_id);
        if (profile.trackedPrograms && profile.trackedPrograms.length > 0) {
            const { data: programs } = await supabase
                .from('programs')
                .select('field_of_study')
                .in('id', profile.trackedPrograms);
            if (programs) {
                userFieldTags = [...new Set(programs.map((p: any) => p.field_of_study).filter(Boolean))];
            }
        }
    }

    // Split topics into recommended and other
    const recommended: typeof topics = [];
    const other: typeof topics = [];

    for (const topic of topics) {
        const topicTags = topic.field_tags || [];
        const isMatch = userFieldTags.length > 0 &&
            topicTags.some((tag: string) => userFieldTags.includes(tag));
        if (isMatch) {
            recommended.push(topic);
        } else {
            other.push(topic);
        }
    }

    // Build message
    const inviteLink = forumGroup?.invite_link;
    let msg = `👥 <b>קהילת מתלבטים</b>\n\n`;
    msg += `הצטרפו לקהילת הטלגרם שלנו - שאלות, טיפים, ועדכונים.\n`;
    msg += `הצטרפו פעם אחת ותוכלו לגלוש בכל הנושאים!\n\n`;

    const rows: InlineKeyboardButton[][] = [];

    // Join group button
    if (inviteLink) {
        rows.push([urlBtn('🚀 הצטרף לקהילה', inviteLink)]);
    }

    // Recommended topics
    if (recommended.length > 0) {
        msg += `⭐ <b>נושאים מומלצים לך:</b>\n`;
        for (const topic of recommended) {
            const icon = getTopicIcon(topic.type);
            msg += `${icon} <b>${topic.name}</b>`;
            if (topic.description) msg += ` - ${topic.description}`;
            msg += '\n';
        }
        msg += '\n';
    }

    // All other topics
    const otherTopics = recommended.length > 0 ? other : topics;
    if (otherTopics.length > 0) {
        msg += `${recommended.length > 0 ? '📋 <b>כל הנושאים:</b>' : '📋 <b>נושאים פעילים:</b>'}\n`;
        for (const topic of otherTopics) {
            const icon = getTopicIcon(topic.type);
            msg += `${icon} <b>${topic.name}</b>`;
            if (topic.description) msg += ` - ${topic.description}`;
            msg += '\n';
        }
    }

    // Web CTA for unlinked users
    if (!user.web_user_id) {
        msg += `\n💡 חשב סיכויים באתר כדי לקבל המלצות מותאמות!`;
        rows.push([urlBtn('🌐 חשב סיכויים באתר', webUrl())]);
    }

    rows.push([btn('📤 שתף עם חברים', 'cmd:share'), btn('🏠 תפריט ראשי', 'cmd:start')]);

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(rows) });
    await logMessage(user.id, 'outgoing', 'rooms_list');
}

/**
 * Backward compat: show standalone groups (non-forum)
 */
async function showLegacyGroups(ctx: HandlerContext, groups: any[]): Promise<void> {
    const { chatId, user } = ctx;

    let msg = `👥 <b>חדרי לימוד פעילים</b>\n\n`;
    const rows: InlineKeyboardButton[][] = [];

    for (const group of groups) {
        const icon = getTopicIcon(group.type);
        msg += `${icon} <b>${group.name}</b>`;
        if (group.member_count > 0) msg += ` (${group.member_count} חברים)`;
        msg += '\n';
        if (group.invite_link) {
            rows.push([urlBtn(`${icon} ${group.name}`, group.invite_link)]);
        }
    }

    msg += '\nלחץ על חדר כדי להצטרף:';

    if (!user.web_user_id) {
        rows.push([urlBtn('🌐 חשב סיכויים באתר', webUrl())]);
    }
    rows.push([btn('📤 שתף', 'cmd:share'), btn('🏠 תפריט ראשי', 'cmd:start')]);

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(rows) });
    await logMessage(user.id, 'outgoing', 'rooms_list');
}

function getTopicIcon(type: string): string {
    switch (type) {
        case 'general': return '🏠';
        case 'field': return '💻';
        case 'stage': return '📅';
        default: return '📚';
    }
}
