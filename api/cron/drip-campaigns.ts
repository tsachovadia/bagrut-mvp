import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { BotUser, DripStage } from '../lib/telegram/types';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegramMessage(chatId: string, text: string) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    const data = (await res.json()) as { error_code?: number };
    if (data.error_code === 403) {
        // User blocked bot
        await supabase.from('bot_users').update({ is_blocked: true }).eq('telegram_chat_id', chatId);
    }
    return data;
}

// Drip stage definitions
interface DripDef {
    fromStage: DripStage;
    toStage: DripStage;
    delayHours: number;
    condition: (user: BotUser) => boolean;
    message: (user: BotUser) => string;
}

const DRIP_DEFINITIONS: DripDef[] = [
    {
        fromStage: 'welcome',
        toStage: 'nudge_grades',
        delayHours: 24,
        condition: (u) => !Array.isArray(u.grades) || u.grades.length === 0,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 👋\n\n` +
            `שמנו לב שעדיין לא הזנת ציוני בגרות.\n` +
            `זה לוקח פחות מ-2 דקות ומאפשר לך לראות לאיפה תתקבל!\n\n` +
            `שלח /grades כדי להתחיל.`,
    },
    {
        fromStage: 'nudge_grades',
        toStage: 'partial_grades',
        delayHours: 48,
        condition: (u: BotUser) => Array.isArray(u.grades) && u.grades.length > 0 && u.grades.length < 5,
        message: (u: BotUser) =>
            `📝 הזנת ${u.grades?.length || 0} מקצועות - יופי!\n\n` +
            `אבל ככל שתזין יותר, התוצאות יהיו מדויקות יותר.\n` +
            `שלח /grades כדי להוסיף עוד מקצועות.`,
    },
    {
        fromStage: 'partial_grades',
        toStage: 'nudge_psycho',
        delayHours: 24,
        condition: (u: BotUser) => Array.isArray(u.grades) && u.grades.length >= 3 && (!u.psychometric || u.psychometric.general === 0),
        message: (u: BotUser) =>
            `🧠 יש לך כבר ${u.grades?.length || 0} מקצועות.\n\n` +
            `כדי לחשב סכמי קבלה מדויקים, הזן גם ציון פסיכומטרי.\n` +
            `שלח /psycho כדי להזין.`,
    },
    {
        fromStage: 'nudge_psycho',
        toStage: 'first_results',
        delayHours: 2,
        condition: (u: BotUser) => u.lead_stage === 'simulated',
        message: () =>
            `📊 ראית את התוצאות שלך!\n\n` +
            `הנה כמה דברים שאפשר לעשות עכשיו:\n` +
            `🔍 חפש תוכניות ספציפיות - /programs\n` +
            `👥 הצטרף לקהילה של סטודנטים - /rooms\n` +
            `📤 שתף את התוצאות עם חברים - /share`,
    },
    {
        fromStage: 'first_results',
        toStage: 'track_programs',
        delayHours: 48,
        condition: (u: BotUser) => (u.tracked_programs || []).length === 0,
        message: () =>
            `🎯 טיפ: שמור תוכניות שמעניינות אותך כדי לקבל עדכונים.\n\n` +
            `שלח /programs, בחר תוכנית, ולחץ על "עקוב".\n` +
            `ככה תדע מיד אם משהו השתנה!`,
    },
    {
        fromStage: 'track_programs',
        toStage: 'community',
        delayHours: 24,
        condition: (u: BotUser) => (u.rooms_joined || []).length === 0,
        message: () =>
            `👥 הצטרף לחדרי הלימוד שלנו!\n\n` +
            `שם תוכל לשאול שאלות, לקבל טיפים, ולהכיר סטודנטים.\n` +
            `שלח /rooms לראות את החדרים הפעילים.`,
    },
    {
        fromStage: 'community',
        toStage: 'share',
        delayHours: 168, // 7 days
        condition: () => true,
        message: () =>
            `📤 חברים שלך גם מתלבטים?\n\n` +
            `שתף אותם וגם הם יוכלו לבדוק את סיכויי הקבלה שלהם!\n` +
            `שלח /share לקבל את הלינק האישי שלך.`,
    },
    {
        fromStage: 'share',
        toStage: 're_engage',
        delayHours: 336, // 14 days
        condition: () => true,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 👋\n\n` +
            `עבר זמן מאז שהשתמשת בבוט.\n` +
            `אם הציונים שלך השתנו, בוא לעדכן ולראות אם נפתחו הזדמנויות חדשות!\n\n` +
            `שלח /calculate לחישוב מחדש.`,
    },
];

/**
 * Cron job: Process drip campaigns
 * Schedule: Every 2 hours (0 *‌/2 * * *)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret (Vercel sends this for cron jobs)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow in dev without secret
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    let totalSent = 0;
    let totalProcessed = 0;

    for (const drip of DRIP_DEFINITIONS) {
        // Calculate the threshold timestamp
        const threshold = new Date(Date.now() - drip.delayHours * 3600 * 1000).toISOString();

        // Find eligible users
        const { data: users } = await supabase
            .from('bot_users')
            .select('*')
            .eq('drip_stage', drip.fromStage)
            .eq('is_blocked', false)
            .or(`drip_last_sent_at.is.null,drip_last_sent_at.lt.${threshold}`)
            .limit(100); // Process max 100 per drip per run

        if (!users || users.length === 0) continue;

        for (const user of users as BotUser[]) {
            totalProcessed++;

            if (!drip.condition(user)) {
                // User doesn't meet condition but might need to advance stage
                // (e.g., they already entered grades, skip nudge_grades)
                await supabase.from('bot_users').update({
                    drip_stage: drip.toStage,
                    drip_last_sent_at: new Date().toISOString(),
                }).eq('id', user.id);
                continue;
            }

            // Send the drip message
            const message = drip.message(user);
            await sendTelegramMessage(user.telegram_chat_id, message);

            // Update drip stage
            await supabase.from('bot_users').update({
                drip_stage: drip.toStage,
                drip_last_sent_at: new Date().toISOString(),
            }).eq('id', user.id);

            // Log
            await supabase.from('bot_messages_log').insert({
                bot_user_id: user.id,
                direction: 'outgoing',
                message_type: 'drip',
                content: message.substring(0, 200),
                campaign_id: `drip_${drip.fromStage}_to_${drip.toStage}`,
            });

            totalSent++;

            // Rate limiting: max 25 messages per second (leaving buffer)
            if (totalSent % 25 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }
        }
    }

    return res.status(200).json({
        ok: true,
        processed: totalProcessed,
        sent: totalSent,
        timestamp: new Date().toISOString(),
    });
}
