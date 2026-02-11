import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn } from '../client.js';
import { logMessage } from '../middleware.js';
import { calculateForBot, type Sector } from '../../shared/calculator.js';
import { ALL_PROGRAMS } from '../../shared/programs.js';

/**
 * Handle /help command
 */
export async function handleHelp(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    await sendMessage(chatId,
        `❓ <b>עזרה - מתלבטים בוט</b>\n\n` +
        `📝 /grades - הזנת ציוני בגרות\n` +
        `🧠 /psycho - הזנת ציוני פסיכומטרי\n` +
        `📊 /calculate - חישוב ממוצע וסכמי קבלה\n` +
        `🔍 /programs - חיפוש תוכניות לימודים\n` +
        `👥 /rooms - חדרי לימוד (קהילה)\n` +
        `📋 /status - הפרופיל שלי\n` +
        `📤 /share - שתף עם חברים\n` +
        `❓ /help - עזרה\n\n` +
        `💡 <b>טיפ:</b> התחל עם /grades כדי להזין ציונים, ואז /calculate לראות תוצאות!`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(btn('📝 הזן ציונים', 'cmd:grades'), btn('📊 חשב', 'cmd:calculate')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'help');
}

/**
 * Handle /status command - show user profile summary
 */
export async function handleStatus(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const gradesCount = Array.isArray(user.grades) ? user.grades.length : 0;
    const hasPsycho = user.psychometric?.general > 0;
    const trackedCount = (user.tracked_programs || []).length;

    let msg = `📋 <b>הפרופיל שלי</b>\n\n`;

    // Sector
    const sectorNames: Record<string, string> = {
        mamlachti: 'ממלכתי', mamlachti_dati: 'ממלכתי-דתי', arab: 'ערבי', druze: 'דרוזי'
    };
    msg += `🎓 מגזר: ${user.sector ? sectorNames[user.sector] || user.sector : 'לא נבחר'}\n`;

    // Grades
    msg += `📝 ציוני בגרות: ${gradesCount > 0 ? `${gradesCount} מקצועות` : 'לא הוזנו'}\n`;
    if (gradesCount > 0 && Array.isArray(user.grades)) {
        for (const g of user.grades.slice(0, 5)) {
            msg += `   • ${g.subject} (${g.units} יח״ל): ${g.grade}\n`;
        }
        if (gradesCount > 5) msg += `   ...ועוד ${gradesCount - 5}\n`;
    }

    // Psychometric
    msg += `🧠 פסיכומטרי: ${hasPsycho ? user.psychometric.general : 'לא הוזן'}\n`;

    // Quick calculation if data available
    if (gradesCount > 0) {
        const psycho = {
            general: user.psychometric?.general || 0,
            quantitative: user.psychometric?.quantitative || 0,
            verbal: user.psychometric?.verbal || 0,
            english: user.psychometric?.english || 0,
            total: user.psychometric?.total || user.psychometric?.general || 0,
        };
        const result = calculateForBot(user.grades, psycho, (user.sector as Sector) || undefined);
        msg += `\n📊 ממוצע מותאם: <b>${result.bagrutAverage.toFixed(1)}</b>\n`;
    }

    // Tracked programs
    msg += `\n🎯 תוכניות בעקיבה: ${trackedCount}\n`;
    if (trackedCount > 0) {
        for (const progId of user.tracked_programs.slice(0, 3)) {
            const prog = ALL_PROGRAMS.find(p => p.program.id === progId);
            if (prog) msg += `   • ${prog.program.name} (${prog.program.institution?.name || ''})\n`;
        }
    }

    // Referral
    msg += `\n📤 קוד הפניה: <code>${user.referral_code}</code>\n`;
    msg += `👥 חברים שהזמנת: ${user.referral_count || 0}\n`;

    await sendMessage(chatId, msg, {
        reply_markup: inlineKeyboard([
            keyboardRow(btn('📝 עדכן ציונים', 'cmd:grades'), btn('🧠 עדכן פסיכומטרי', 'cmd:psycho')),
            keyboardRow(btn('📊 חשב תוצאות', 'cmd:calculate'), btn('📤 שתף', 'cmd:share')),
        ]),
    });

    await logMessage(user.id, 'outgoing', 'status');
}

/**
 * Handle /share command - generate referral link
 */
export async function handleShare(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const referralLink = `https://t.me/MitlabtimBot?start=ref_${user.referral_code}`;

    // Check if user has calculation results to share
    const gradesCount = Array.isArray(user.grades) ? user.grades.length : 0;
    let shareText = '';

    if (gradesCount > 0) {
        const psycho = {
            general: user.psychometric?.general || 0,
            quantitative: user.psychometric?.quantitative || 0,
            verbal: user.psychometric?.verbal || 0,
            english: user.psychometric?.english || 0,
            total: user.psychometric?.total || user.psychometric?.general || 0,
        };
        const result = calculateForBot(user.grades, psycho, (user.sector as Sector) || undefined, ALL_PROGRAMS);
        const reachableCount = result.programResults.filter(p => p.isReachable).length;

        shareText = `🎓 בדקתי את סיכויי הקבלה שלי - עומד בתנאים ל-${reachableCount} תוכניות!\n` +
            `ממוצע: ${result.bagrutAverage.toFixed(1)}\n` +
            `גלה את הסיכויים שלך 👉 ${referralLink}`;
    } else {
        shareText = `🎓 גליתי את מתלבטים - כלי חינמי לבדיקת סיכויי קבלה לאוניברסיטה!\n` +
            `בדוק את הסיכויים שלך 👉 ${referralLink}`;
    }

    await sendMessage(chatId,
        `📤 <b>שתף עם חברים!</b>\n\n` +
        `הלינק האישי שלך:\n<code>${referralLink}</code>\n\n` +
        `📋 טקסט לשיתוף:\n<i>${shareText}</i>\n\n` +
        `כל חבר שמצטרף דרכך = נחשב!\n` +
        `הזמנת עד עכשיו: <b>${user.referral_count || 0}</b> חברים`
    );

    await logMessage(user.id, 'outgoing', 'share');
}
