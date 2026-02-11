import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
        await supabase.from('bot_users').update({ is_blocked: true }).eq('telegram_chat_id', chatId);
    }
    return data;
}

/**
 * Cron job: Send exam deadline reminders
 * Schedule: Daily at 8:00 AM Israel time (0 6 * * * UTC, Israel is UTC+2/+3)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    let totalSent = 0;

    // Get upcoming exams in next 7 days
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: exams } = await supabase
        .from('exam_schedules')
        .select('*')
        .gte('exam_date', now.toISOString().split('T')[0])
        .lte('exam_date', weekFromNow.toISOString().split('T')[0])
        .order('exam_date', { ascending: true });

    if (!exams || exams.length === 0) {
        return res.status(200).json({ ok: true, message: 'No upcoming exams', sent: 0 });
    }

    // Get all active bot users with grades
    const { data: users } = await supabase
        .from('bot_users')
        .select('id, telegram_chat_id, first_name, grades')
        .eq('is_blocked', false)
        .not('grades', 'eq', '[]');

    if (!users || users.length === 0) {
        return res.status(200).json({ ok: true, message: 'No users with grades', sent: 0 });
    }

    for (const exam of exams) {
        const examDate = new Date(exam.exam_date);
        const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        // Only send reminders for specific intervals: 7 days, 3 days, 1 day
        if (daysUntil !== 7 && daysUntil !== 3 && daysUntil !== 1) continue;

        // Find users who have this subject in their grades
        for (const user of users) {
            const grades = user.grades as any[];
            if (!Array.isArray(grades)) continue;

            const hasSubject = grades.some((g: any) => g.subject === exam.subject);
            if (!hasSubject) continue;

            const urgency = daysUntil === 1 ? '⚠️' : daysUntil === 3 ? '📅' : '⏰';
            const message =
                `${urgency} <b>תזכורת מבחן</b>\n\n` +
                `מקצוע: <b>${exam.subject}</b>\n` +
                `תאריך: ${exam.exam_date}\n` +
                `מועד: ${exam.season || ''}\n` +
                `בעוד: <b>${daysUntil} ${daysUntil === 1 ? 'יום' : 'ימים'}</b>\n\n` +
                `בהצלחה! 🍀`;

            await sendTelegramMessage(user.telegram_chat_id, message);
            totalSent++;

            // Rate limiting
            if (totalSent % 25 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }
        }
    }

    return res.status(200).json({
        ok: true,
        exams_found: exams.length,
        sent: totalSent,
        timestamp: new Date().toISOString(),
    });
}
