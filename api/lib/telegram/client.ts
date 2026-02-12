import type { InlineKeyboardMarkup, SendMessageOptions } from './types.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramApi(method: string, body: Record<string, any>): Promise<any> {
    const res = await fetch(`${BASE_URL}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; error_code?: number };
    if (!data.ok) {
        console.error(`Telegram API error [${method}]:`, data);
        // Detect user blocked bot
        if (data.error_code === 403) {
            throw new Error('USER_BLOCKED');
        }
    }
    return data;
}

export async function sendMessage(
    chatId: number | string,
    text: string,
    options: SendMessageOptions = {}
): Promise<any> {
    return telegramApi('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'HTML',
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? true,
    });
}

export async function editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    options: SendMessageOptions = {}
): Promise<any> {
    return telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: options.parse_mode || 'HTML',
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? true,
    });
}

export async function answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert: boolean = false
): Promise<any> {
    return telegramApi('answerCallbackQuery', {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
    });
}

export async function deleteMessage(
    chatId: number | string,
    messageId: number
): Promise<any> {
    return telegramApi('deleteMessage', {
        chat_id: chatId,
        message_id: messageId,
    });
}

export async function exportChatInviteLink(chatId: number | string): Promise<string | null> {
    try {
        const result = await telegramApi('exportChatInviteLink', { chat_id: chatId });
        return result.result || null;
    } catch {
        return null;
    }
}

export async function getChatMemberCount(chatId: number | string): Promise<number> {
    try {
        const result = await telegramApi('getChatMemberCount', { chat_id: chatId });
        return result.result || 0;
    } catch {
        return 0;
    }
}

// ============================
// Forum Topic Management
// ============================

export async function createForumTopic(
    chatId: number | string,
    name: string,
    iconColor?: number
): Promise<{ message_thread_id: number; name: string } | null> {
    try {
        const body: Record<string, any> = { chat_id: chatId, name };
        if (iconColor) body.icon_color = iconColor;
        const result = await telegramApi('createForumTopic', body);
        return result.result || null;
    } catch {
        return null;
    }
}

export async function editForumTopic(
    chatId: number | string,
    topicId: number,
    name?: string
): Promise<boolean> {
    try {
        const body: Record<string, any> = { chat_id: chatId, message_thread_id: topicId };
        if (name) body.name = name;
        await telegramApi('editForumTopic', body);
        return true;
    } catch {
        return false;
    }
}

export async function closeForumTopic(
    chatId: number | string,
    topicId: number
): Promise<boolean> {
    try {
        await telegramApi('closeForumTopic', { chat_id: chatId, message_thread_id: topicId });
        return true;
    } catch {
        return false;
    }
}

export async function reopenForumTopic(
    chatId: number | string,
    topicId: number
): Promise<boolean> {
    try {
        await telegramApi('reopenForumTopic', { chat_id: chatId, message_thread_id: topicId });
        return true;
    } catch {
        return false;
    }
}

export async function sendMessageToTopic(
    chatId: number | string,
    topicId: number,
    text: string,
    options: SendMessageOptions = {}
): Promise<any> {
    return telegramApi('sendMessage', {
        chat_id: chatId,
        message_thread_id: topicId,
        text,
        parse_mode: options.parse_mode || 'HTML',
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? true,
    });
}

/**
 * Build a web URL with ?from=telegram so the website can show a "return to bot" button
 */
export function webUrl(path = ''): string {
    const base = process.env.WEB_APP_URL || 'https://mitlabtim.co.il';
    return `${base}${path}?from=telegram`;
}

// Keyboard builder helpers
export function inlineKeyboard(rows: { text: string; callback_data?: string; url?: string }[][]): InlineKeyboardMarkup {
    return { inline_keyboard: rows };
}

export function keyboardRow(...buttons: { text: string; callback_data?: string; url?: string }[]): { text: string; callback_data?: string; url?: string }[] {
    return buttons;
}

export function btn(text: string, callbackData: string): { text: string; callback_data: string } {
    return { text, callback_data: callbackData };
}

export function urlBtn(text: string, url: string): { text: string; url: string } {
    return { text, url };
}
