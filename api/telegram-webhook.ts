/// <reference path="./types.d.ts" />
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TelegramUpdate, HandlerContext } from './lib/telegram/types.js';
import { verifyWebhook, resolveUser, touchUser, markUserBlocked, logMessage } from './lib/telegram/middleware.js';
import { sendMessage } from './lib/telegram/client.js';

// Handlers
import { handleStart } from './lib/telegram/handlers/start.js';
import { handleGrades, handleGradeScore } from './lib/telegram/handlers/grades.js';
import { handlePsychometric, handlePsychometricScore } from './lib/telegram/handlers/psychometric.js';
import { handleCalculate } from './lib/telegram/handlers/calculate.js';
import { handlePrograms } from './lib/telegram/handlers/programs.js';
import { handleRooms } from './lib/telegram/handlers/rooms.js';
import { handleHelp, handleStatus, handleShare } from './lib/telegram/handlers/misc.js';
import { handleCallback } from './lib/telegram/handlers/callback-router.js';
import { handleGroupMessage, handleNewMember } from './lib/telegram/handlers/group-events.js';
import { handleConsent } from './lib/telegram/handlers/consent.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // Verify webhook authenticity
    if (!verifyWebhook(request)) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const update: TelegramUpdate = request.body;

        // Handle group messages separately
        if (update.message?.chat?.type === 'group' || update.message?.chat?.type === 'supergroup') {
            if (update.message.new_chat_members) {
                await handleNewMember(update.message);
            } else {
                await handleGroupMessage(update.message);
            }
            return response.status(200).json({ ok: true });
        }

        // Only handle private chat messages and callbacks
        if (!update.message && !update.callback_query) {
            return response.status(200).json({ ok: true });
        }

        // Resolve or create bot user
        const botUser = await resolveUser(update);

        // Update activity
        await touchUser(botUser.id);

        // Build handler context
        const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
        if (!chatId) {
            return response.status(200).json({ ok: true });
        }

        const ctx: HandlerContext = {
            chatId,
            user: botUser,
            message: update.message,
            callbackQuery: update.callback_query,
        };

        // Route callback queries
        if (update.callback_query) {
            await handleCallback(ctx);
            return response.status(200).json({ ok: true });
        }

        // Route text messages
        const text = update.message?.text?.trim();
        if (!text) {
            return response.status(200).json({ ok: true });
        }

        // Commands
        if (text.startsWith('/')) {
            const [command, ...args] = text.split(' ');
            const payload = args.join(' ');

            switch (command.split('@')[0]) { // Handle /command@BotName format
                case '/start':
                    await handleStart(ctx, payload || undefined);
                    break;
                case '/grades':
                    await handleGrades(ctx);
                    break;
                case '/psycho':
                    await handlePsychometric(ctx);
                    break;
                case '/calculate':
                    await handleCalculate(ctx);
                    break;
                case '/programs':
                    await handlePrograms(ctx);
                    break;
                case '/rooms':
                    await handleRooms(ctx);
                    break;
                case '/status':
                    await handleStatus(ctx);
                    break;
                case '/share':
                    await handleShare(ctx);
                    break;
                case '/help':
                    await handleHelp(ctx);
                    break;
                case '/consent':
                    await handleConsent(ctx);
                    break;
                default:
                    await sendMessage(chatId, 'פקודה לא מוכרת. שלח /help לרשימת פקודות.');
            }

            return response.status(200).json({ ok: true });
        }

        // Non-command text: route based on conversation state
        await handleTextInput(ctx, text);

        return response.status(200).json({ ok: true });
    } catch (error: any) {
        console.error('Telegram webhook error:', error);

        // Handle blocked user
        if (error?.message === 'USER_BLOCKED') {
            const chatId = request.body?.message?.chat?.id || request.body?.callback_query?.message?.chat?.id;
            if (chatId) {
                await markUserBlocked(chatId.toString());
            }
        }

        // Always return 200 to Telegram to prevent retry storms
        return response.status(200).json({ ok: true });
    }
}

/**
 * Route plain text messages based on the user's current conversation state
 */
async function handleTextInput(ctx: HandlerContext, text: string): Promise<void> {
    const { user } = ctx;

    switch (user.conversation_state) {
        case 'grade_entry_score':
            await handleGradeScore(ctx, text);
            break;

        case 'psychometric_general':
        case 'psychometric_quant':
        case 'psychometric_verbal':
        case 'psychometric_english':
            await handlePsychometricScore(ctx, text);
            break;

        case 'idle':
        default:
            // User sent free text without being in a flow
            await logMessage(user.id, 'incoming', 'text', text);
            await sendMessage(ctx.chatId,
                'לא הבנתי. שלח /help לראות את רשימת הפקודות הזמינות.',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📝 הזן ציונים', callback_data: 'cmd:grades' }, { text: '📊 חשב', callback_data: 'cmd:calculate' }],
                            [{ text: '❓ עזרה', callback_data: 'cmd:help' }],
                        ],
                    },
                }
            );
            break;
    }
}
