import type { HandlerContext } from '../types.js';
import { answerCallbackQuery } from '../client.js';
import { logMessage } from '../middleware.js';
import { handleSectorSelection } from './start.js';

// Command shortcuts mapped from callback data
import { handleRooms } from './rooms.js';
import { handleHelp, handleStatus, handleShare } from './misc.js';
import { handleStart } from './start.js';
import { handleConsentCallback } from './consent.js';

/**
 * Route callback queries to the appropriate handler based on data prefix.
 *
 * Callback data format: "prefix:value"
 * - sector:mamlachti     -> Sector selection
 * - cmd:rooms            -> Command shortcut
 * - consent:enable       -> Consent toggle
 * - noop                 -> Do nothing (decorative buttons)
 */
export async function handleCallback(ctx: HandlerContext): Promise<void> {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    // Always answer the callback to remove loading spinner
    await answerCallbackQuery(ctx.callbackQuery!.id);

    // Log the callback
    await logMessage(ctx.user.id, 'incoming', 'callback', undefined, { callback_data: data });

    const [prefix, ...valueParts] = data.split(':');
    const value = valueParts.join(':'); // Rejoin in case value contains ':'

    switch (prefix) {
        case 'sector':
            await handleSectorSelection(ctx, value);
            break;

        case 'cmd':
            await handleCommandShortcut(ctx, value);
            break;

        case 'consent':
            await handleConsentCallback(ctx, value);
            break;

        case 'noop':
            // Do nothing (used for decorative buttons)
            break;

        default:
            console.warn(`Unknown callback prefix: ${prefix}`);
    }
}

async function handleCommandShortcut(ctx: HandlerContext, command: string): Promise<void> {
    switch (command) {
        case 'rooms': await handleRooms(ctx); break;
        case 'help': await handleHelp(ctx); break;
        case 'status': await handleStatus(ctx); break;
        case 'share': await handleShare(ctx); break;
        case 'start': await handleStart(ctx); break;
        default: break;
    }
}
