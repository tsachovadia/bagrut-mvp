import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, urlBtn } from '../client.js';
import { logMessage, supabase } from '../middleware.js';
import { getActiveGroups } from '../services/user-service.js';
import { getWebProfileSummary } from './start.js';

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mitlabtim.co.il';

/**
 * Handle /rooms command - show community rooms with smart recommendations
 */
export async function handleRooms(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    // Fetch rooms from database
    const groups = await getActiveGroups();

    if (groups.length === 0) {
        await sendMessage(chatId,
            `👥 <b>חדרי לימוד</b>\n\n` +
            `הקהילה שלנו בטלגרם מחברת בין סטודנטים ומועמדים.\n\n` +
            `🏠 <b>מתלבטים - הקהילה</b>\nקבוצה כללית לשאלות ודיונים\n\n` +
            `💻 <b>חדר CS והנדסה</b>\nלכל מי שמעוניין בהנדסה ומדעי המחשב\n\n` +
            `📅 <b>נרשמים 2026</b>\nקבוצה למתכננים להתחיל לימודים ב-2026\n\n` +
            `הקבוצות ייפתחו בקרוב! שלח /help לראות מה עוד אפשר לעשות.`,
        );
        await logMessage(user.id, 'outgoing', 'rooms_empty');
        return;
    }

    // If user is linked, get their profile for smart recommendations
    let userFieldTags: string[] = [];
    if (user.web_user_id) {
        const profile = await getWebProfileSummary(user.web_user_id);
        // Get user's tracked program fields for matching
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

    // Split rooms into recommended and all
    const recommended: typeof groups = [];
    const other: typeof groups = [];

    for (const group of groups) {
        const groupTags = (group as any).field_tags || [];
        const isMatch = userFieldTags.length > 0 &&
            groupTags.some((tag: string) => userFieldTags.includes(tag));

        if (isMatch) {
            recommended.push(group);
        } else {
            other.push(group);
        }
    }

    let msg = '';
    const rows: ReturnType<typeof urlBtn>[][] = [];

    // Show recommended rooms first
    if (recommended.length > 0) {
        msg += `⭐ <b>חדרים מומלצים לך:</b>\n\n`;
        for (const group of recommended) {
            const icon = getRoomIcon(group.type);
            msg += `${icon} <b>${group.name}</b>`;
            if (group.member_count > 0) msg += ` (${group.member_count} חברים)`;
            msg += '\n';
            if (group.invite_link) {
                rows.push([urlBtn(`⭐ ${group.name}`, group.invite_link)]);
            }
        }
        msg += '\n';
    }

    // Show all other rooms
    const otherRooms = recommended.length > 0 ? other : groups;
    if (otherRooms.length > 0) {
        msg += `👥 <b>${recommended.length > 0 ? 'כל החדרים:' : 'חדרי לימוד פעילים'}</b>\n\n`;
        for (const group of otherRooms) {
            const icon = getRoomIcon(group.type);
            msg += `${icon} <b>${group.name}</b>`;
            if (group.member_count > 0) msg += ` (${group.member_count} חברים)`;
            msg += '\n';
            if (group.invite_link) {
                rows.push([urlBtn(`${icon} ${group.name}`, group.invite_link)]);
            }
        }
    }

    msg += '\nלחץ על חדר כדי להצטרף:';

    // Add web app CTA for unlinked users
    if (!user.web_user_id) {
        rows.push([urlBtn('🌐 חשב סיכויים באתר', WEB_APP_URL)]);
    }

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(rows) });
    await logMessage(user.id, 'outgoing', 'rooms_list');
}

function getRoomIcon(type: string): string {
    switch (type) {
        case 'general': return '🏠';
        case 'field': return '💻';
        case 'stage': return '📅';
        default: return '📚';
    }
}
