import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTelegramMessage(chatId: number, text: string) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
        }),
    });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const update = request.body;
        const message = update?.message;

        if (!message?.text) {
            return response.status(200).json({ ok: true });
        }

        const chatId = message.chat.id;
        const text = message.text;
        const username = message.from?.username || '';
        const firstName = message.from?.first_name || '';

        // Handle /start command with optional program ID deep link
        if (text.startsWith('/start')) {
            const programId = text.split(' ')[1] || null;

            // Store lead in Supabase
            await supabase.from('soft_leads').insert({
                source: 'telegram_bot',
                telegram_chat_id: chatId.toString(),
                telegram_username: username,
                name: firstName,
                metadata: { program_id: programId },
            });

            // Send welcome message
            const welcomeMessage = programId
                ? `היי ${firstName}! 👋\n\nקיבלנו את הבקשה שלך להתחבר לסטודנטים.\nאנחנו נחבר אותך בהקדם לסטודנטים שלומדים את התואר שבחרת.\n\nבינתיים, אם יש לך שאלות - פשוט כתוב לנו כאן!`
                : `היי ${firstName}! 👋\n\nברוכים הבאים ל-LaunchPad!\nאנחנו יכולים לחבר אותך לסטודנטים שלומדים תארים שמעניינים אותך.\n\nספר לנו איזה תואר מעניין אותך ונחבר אותך!`;

            await sendTelegramMessage(chatId, welcomeMessage);
        } else {
            // For any other message, store it and send acknowledgment
            await supabase.from('soft_leads').insert({
                source: 'telegram_bot',
                telegram_chat_id: chatId.toString(),
                telegram_username: username,
                name: firstName,
                metadata: { message: text },
            });

            await sendTelegramMessage(
                chatId,
                'תודה! קיבלנו את ההודעה שלך ונחזור אליך בהקדם 🙏'
            );
        }

        return response.status(200).json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        return response.status(200).json({ ok: true }); // Always return 200 to Telegram
    }
}
