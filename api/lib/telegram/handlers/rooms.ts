import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn, urlBtn } from '../client.js';
import { logMessage } from '../middleware.js';
import { getActiveGroups } from '../services/user-service.js';

/**
 * Handle /rooms command - show available community rooms
 */
export async function handleRooms(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    // Fetch rooms from database
    const groups = await getActiveGroups();

    if (groups.length === 0) {
        // Fallback: show static rooms if DB is empty (initial setup)
        await sendMessage(chatId,
            `👥 <b>חדרי לימוד</b>\n\n` +
            `הקהילה שלנו בטלגרם מחברת בין סטודנטים ומועמדים.\n\n` +
            `🏠 <b>מתלבטים - הקהילה</b>\nקבוצה כללית לשאלות ודיונים\n\n` +
            `💻 <b>חדר CS והנדסה</b>\nלכל מי שמעוניין בהנדסה ומדעי המחשב\n\n` +
            `📅 <b>נרשמים 2026</b>\nקבוצה למתכננים להתחיל לימודים ב-2026\n\n` +
            `הקבוצות ייפתחו בקרוב! שלח /help לראות מה עוד אפשר לעשות.`,
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(btn('📝 הזן ציונים', 'cmd:grades'), btn('📊 חשב תוצאות', 'cmd:calculate')),
                ]),
            }
        );
        await logMessage(user.id, 'outgoing', 'rooms_empty');
        return;
    }

    let msg = `👥 <b>חדרי לימוד פעילים</b>\n\n`;

    const rows = [];
    for (const group of groups) {
        const icon = group.type === 'general' ? '🏠' :
            group.type === 'field' ? '💻' :
            group.type === 'stage' ? '📅' : '📚';

        msg += `${icon} <b>${group.name}</b>`;
        if (group.member_count > 0) msg += ` (${group.member_count} חברים)`;
        msg += '\n';

        if (group.invite_link) {
            rows.push([urlBtn(`${icon} ${group.name}`, group.invite_link)]);
        }
    }

    msg += '\nלחץ על קבוצה כדי להצטרף:';

    rows.push([btn('◀️ חזרה לתפריט', 'cmd:start')]);

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(rows) });
    await logMessage(user.id, 'outgoing', 'rooms_list');
}
