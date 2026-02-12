import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn, urlBtn } from '../client.js';
import { logMessage } from '../middleware.js';
import { getWebProfileSummary } from './start.js';

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mitlabtim.co.il';

/**
 * Handle /help command
 */
export async function handleHelp(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    await sendMessage(chatId,
        `❓ <b>עזרה - מתלבטים בוט</b>\n\n` +
        `👥 /rooms - חדרי לימוד (קהילה)\n` +
        `📋 /status - הפרופיל שלי\n` +
        `📤 /share - שתף עם חברים\n` +
        `✅ /consent - הגדרות פרטיות\n` +
        `❓ /help - עזרה\n\n` +
        `💡 <b>טיפ:</b> חשב את סיכויי הקבלה שלך באתר, ואז חבר את החשבון כדי לקבל עדכונים כאן!`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn('🌐 חשב סיכויים באתר', WEB_APP_URL)),
                keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📋 סטטוס', 'cmd:status')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'help');
}

/**
 * Handle /status command - show profile from web app data
 */
export async function handleStatus(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const sectorNames: Record<string, string> = {
        mamlachti: 'ממלכתי', mamlachti_dati: 'ממלכתי-דתי', arab: 'ערבי', druze: 'דרוזי'
    };

    let msg = `📋 <b>הפרופיל שלי</b>\n\n`;

    // Sector
    msg += `🎓 מגזר: ${user.sector ? sectorNames[user.sector] || user.sector : 'לא נבחר'}\n`;

    // Web account status
    if (user.web_user_id) {
        msg += `🔗 חשבון: <b>מחובר</b>\n`;

        // Pull real data from web app
        const profile = await getWebProfileSummary(user.web_user_id);

        msg += `📝 ציוני בגרות: ${profile.gradesCount > 0 ? `${profile.gradesCount} מקצועות` : 'לא הוזנו באתר'}\n`;
        if (profile.bagrutAvg) {
            msg += `📊 ממוצע: <b>${profile.bagrutAvg.toFixed(1)}</b>\n`;
        }
        msg += `🧠 פסיכומטרי: ${profile.psychoTotal ? `<b>${profile.psychoTotal}</b>` : 'לא הוזן באתר'}\n`;

        const trackedCount = profile.trackedPrograms?.length || 0;
        msg += `🎯 תוכניות בעקיבה: ${trackedCount}\n`;
    } else {
        msg += `🔗 חשבון: <b>לא מחובר</b>\n`;
        msg += `\n💡 חבר את החשבון מהאתר כדי לראות את הנתונים שלך כאן.\n`;
    }

    // Referral info
    msg += `\n📤 קוד הפניה: <code>${user.referral_code}</code>\n`;
    msg += `👥 חברים שהזמנת: ${user.referral_count || 0}\n`;

    const buttons = user.web_user_id
        ? [
            keyboardRow(urlBtn('📊 עדכן נתונים באתר', `${WEB_APP_URL}/dashboard`)),
            keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📤 שתף', 'cmd:share')),
        ]
        : [
            keyboardRow(urlBtn('🌐 הירשם וחשב באתר', WEB_APP_URL)),
            keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📤 שתף', 'cmd:share')),
        ];

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(buttons) });
    await logMessage(user.id, 'outgoing', 'status');
}

/**
 * Handle /share command - generate referral link
 */
export async function handleShare(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const referralLink = `https://t.me/MitlabtimBot?start=ref_${user.referral_code}`;

    const shareText = `🎓 גליתי את מתלבטים - כלי חינמי לבדיקת סיכויי קבלה לאוניברסיטה!\n` +
        `בדוק את הסיכויים שלך 👉 ${referralLink}`;

    await sendMessage(chatId,
        `📤 <b>שתף עם חברים!</b>\n\n` +
        `הלינק האישי שלך:\n<code>${referralLink}</code>\n\n` +
        `📋 טקסט לשיתוף:\n<i>${shareText}</i>\n\n` +
        `כל חבר שמצטרף דרכך = נחשב!\n` +
        `הזמנת עד עכשיו: <b>${user.referral_count || 0}</b> חברים`
    );

    await logMessage(user.id, 'outgoing', 'share');
}
