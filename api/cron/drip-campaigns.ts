import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { BotUser, DripStage } from '../lib/telegram/types.js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mitlabtim.co.il';
function webUrl(path = ''): string { return `${WEB_APP_URL}${path}?from=telegram`; }

async function sendTelegramMessage(chatId: string, text: string, reply_markup?: any) {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true };
    if (reply_markup) body.reply_markup = reply_markup;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = (await res.json()) as { error_code?: number };
    if (data.error_code === 403) {
        await supabase.from('bot_users').update({ is_blocked: true }).eq('telegram_chat_id', chatId);
    }
    return data;
}

// Drip stage definitions - all redirect to web app, all have buttons
interface DripDef {
    fromStage: DripStage;
    toStage: DripStage;
    delayHours: number;
    condition: (user: BotUser) => boolean;
    message: (user: BotUser) => string;
    reply_markup?: any;
}

const DRIP_DEFINITIONS: DripDef[] = [
    {
        fromStage: 'welcome',
        toStage: 'nudge_web',
        delayHours: 24,
        condition: (u) => !u.web_user_id,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 👋\n\n` +
            `חשב את סיכויי הקבלה שלך באתר - לוקח 2 דקות!`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 חשב סיכויים באתר', url: webUrl() }],
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
            ],
        },
    },
    {
        fromStage: 'nudge_web',
        toStage: 'nudge_link',
        delayHours: 48,
        condition: (u) => !u.web_user_id,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 📊\n\n` +
            `חבר את החשבון שלך כדי לקבל עדכונים אישיים ישירות לטלגרם.`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 חבר חשבון באתר', url: webUrl() }],
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
            ],
        },
    },
    {
        fromStage: 'nudge_link',
        toStage: 'nudge_rooms',
        delayHours: 24,
        condition: (u) => (u.rooms_joined || []).length === 0,
        message: () =>
            `👥 הצטרף לחדרי הלימוד שלנו!\n\n` +
            `תלמידים כמוך כבר שם - שואלים שאלות, משתפים טיפים, ועוזרים אחד לשני.`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
                [{ text: '🌐 חשב סיכויים באתר', url: webUrl() }],
            ],
        },
    },
    {
        fromStage: 'nudge_rooms',
        toStage: 'community',
        delayHours: 168, // 7 days
        condition: () => true,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 📢\n\n` +
            `מה חדש? בדוק אם יש עדכונים בסיכויי הקבלה שלך.`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '📊 בדוק עדכונים באתר', url: webUrl('/dashboard') }],
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
            ],
        },
    },
    {
        fromStage: 'community',
        toStage: 'share',
        delayHours: 336, // 14 days
        condition: () => true,
        message: () =>
            `📤 חברים שלך גם מתלבטים?\n\n` +
            `שתף אותם וגם הם יוכלו לבדוק את סיכויי הקבלה שלהם!`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '📤 שתף עם חברים', callback_data: 'cmd:share' }],
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
            ],
        },
    },
    {
        fromStage: 'share',
        toStage: 're_engage',
        delayHours: 720, // 30 days
        condition: () => true,
        message: (u: BotUser) =>
            `היי ${u.first_name || ''}! 👋\n\n` +
            `עבר זמן - בוא לראות אם יש שינויים בסיכויי הקבלה שלך.`,
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 בדוק שינויים באתר', url: webUrl('/dashboard') }],
                [{ text: '👥 חדרי לימוד', callback_data: 'cmd:rooms' }],
            ],
        },
    },
];

/**
 * Cron job: Process drip campaigns
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    let totalSent = 0;
    let totalProcessed = 0;

    for (const drip of DRIP_DEFINITIONS) {
        const threshold = new Date(Date.now() - drip.delayHours * 3600 * 1000).toISOString();

        const { data: users } = await supabase
            .from('bot_users')
            .select('*')
            .eq('drip_stage', drip.fromStage)
            .eq('is_blocked', false)
            .or(`drip_last_sent_at.is.null,drip_last_sent_at.lt.${threshold}`)
            .limit(100);

        if (!users || users.length === 0) continue;

        for (const user of users as BotUser[]) {
            totalProcessed++;

            if (!drip.condition(user)) {
                await supabase.from('bot_users').update({
                    drip_stage: drip.toStage,
                    drip_last_sent_at: new Date().toISOString(),
                }).eq('id', user.id);
                continue;
            }

            const message = drip.message(user);
            await sendTelegramMessage(user.telegram_chat_id, message, drip.reply_markup);

            await supabase.from('bot_users').update({
                drip_stage: drip.toStage,
                drip_last_sent_at: new Date().toISOString(),
            }).eq('id', user.id);

            await supabase.from('bot_messages_log').insert({
                bot_user_id: user.id,
                direction: 'outgoing',
                message_type: 'drip',
                content: message.substring(0, 200),
                campaign_id: `drip_${drip.fromStage}_to_${drip.toStage}`,
            });

            totalSent++;

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
