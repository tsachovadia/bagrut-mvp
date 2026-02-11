import type { HandlerContext } from '../types';
import { answerCallbackQuery } from '../client';
import { logMessage } from '../middleware';
import { handleSectorSelection } from './start';
import { handleSubjectSelected, handleUnitsSelected, handleGradesDone, handleSubjectPage } from './grades';
import { handlePsychometric } from './psychometric';
import { handleFieldSelected, handleProgramDetail, handleTrackProgram } from './programs';

// Command shortcuts mapped from callback data
import { handleGrades } from './grades';
import { handleCalculate } from './calculate';
import { handlePrograms } from './programs';
import { handleRooms } from './rooms';
import { handleHelp, handleStatus, handleShare } from './misc';
import { handleStart } from './start';
import { handleConsentCallback } from './consent';

/**
 * Route callback queries to the appropriate handler based on data prefix.
 *
 * Callback data format: "prefix:value"
 * - sector:mamlachti     → Sector selection
 * - grade_subj:מתמטיקה   → Subject selected for grade entry
 * - grade_units:5         → Units selected
 * - grade_page:1          → Navigate subject keyboard page
 * - grade_done            → Finished entering grades
 * - field:cs              → Program field selected
 * - prog:prog_bgu_cs      → Program detail view
 * - track:prog_bgu_cs     → Toggle track program
 * - psycho_restart        → Restart psychometric entry
 * - cmd:grades            → Command shortcut
 * - noop                  → Do nothing (category headers)
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

        case 'grade_subj':
            await handleSubjectSelected(ctx, value);
            break;

        case 'grade_units':
            await handleUnitsSelected(ctx, parseInt(value, 10));
            break;

        case 'grade_page':
            await handleSubjectPage(ctx, parseInt(value, 10));
            break;

        case 'grade_done':
            await handleGradesDone(ctx);
            break;

        case 'field':
            await handleFieldSelected(ctx, value);
            break;

        case 'prog':
            await handleProgramDetail(ctx, value);
            break;

        case 'track':
            await handleTrackProgram(ctx, value);
            break;

        case 'psycho_restart':
            // Reset psychometric and start over
            await handlePsychometric(ctx);
            break;

        case 'cmd':
            await handleCommandShortcut(ctx, value);
            break;

        case 'consent':
            await handleConsentCallback(ctx, value);
            break;

        case 'noop':
            // Do nothing (used for category headers in keyboards)
            break;

        default:
            console.warn(`Unknown callback prefix: ${prefix}`);
    }
}

async function handleCommandShortcut(ctx: HandlerContext, command: string): Promise<void> {
    switch (command) {
        case 'grades': await handleGrades(ctx); break;
        case 'psycho': await handlePsychometric(ctx); break;
        case 'calculate': await handleCalculate(ctx); break;
        case 'programs': await handlePrograms(ctx); break;
        case 'rooms': await handleRooms(ctx); break;
        case 'help': await handleHelp(ctx); break;
        case 'status': await handleStatus(ctx); break;
        case 'share': await handleShare(ctx); break;
        case 'start': await handleStart(ctx); break;
        default: break;
    }
}
