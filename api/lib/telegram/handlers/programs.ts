import type { HandlerContext } from '../types.js';
import { sendMessage, answerCallbackQuery, inlineKeyboard, keyboardRow, btn } from '../client.js';
import { updateBotUser, logMessage } from '../middleware.js';
import { updateLeadScore } from '../services/lead-scoring.js';
import { ALL_PROGRAMS, PROGRAM_FIELDS, getProgramsByField, getProgramById } from '../../shared/programs.js';

/**
 * Handle /programs command - show field selection
 */
export async function handlePrograms(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const rows = [];
    for (let i = 0; i < PROGRAM_FIELDS.length; i += 2) {
        const row = [btn(PROGRAM_FIELDS[i].label, `field:${PROGRAM_FIELDS[i].id}`)];
        if (PROGRAM_FIELDS[i + 1]) {
            row.push(btn(PROGRAM_FIELDS[i + 1].label, `field:${PROGRAM_FIELDS[i + 1].id}`));
        }
        rows.push(row);
    }
    rows.push([btn('📋 כל התוכניות', 'field:all')]);

    await sendMessage(chatId,
        `🔍 <b>חיפוש תוכניות לימודים</b>\n\nבחר תחום:`,
        { reply_markup: inlineKeyboard(rows) }
    );

    await logMessage(user.id, 'outgoing', 'programs_browse');
}

/**
 * Handle field selection - show programs in that field
 */
export async function handleFieldSelected(ctx: HandlerContext, fieldId: string): Promise<void> {
    const { chatId, user } = ctx;

    const programs = fieldId === 'all' ? ALL_PROGRAMS : getProgramsByField(fieldId);

    if (programs.length === 0) {
        await sendMessage(chatId, 'לא נמצאו תוכניות בתחום זה.');
        return;
    }

    let msg = `📚 <b>תוכניות ${fieldId === 'all' ? 'כל התוכניות' : PROGRAM_FIELDS.find(f => f.id === fieldId)?.label || ''}:</b>\n\n`;

    const rows = [];
    for (const p of programs.slice(0, 10)) {
        msg += `• ${p.program.name} - ${p.program.institution?.name || ''} (${p.program.degree_type})\n`;
        rows.push([btn(`${p.program.name} (${p.program.institution?.name || ''})`, `prog:${p.program.id}`)]);
    }

    if (programs.length > 10) {
        msg += `\n...ועוד ${programs.length - 10} תוכניות`;
    }

    rows.push([btn('◀️ חזרה', 'cmd:programs')]);

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(rows) });
    await logMessage(user.id, 'outgoing', 'field_results', fieldId);
}

/**
 * Handle program detail view
 */
export async function handleProgramDetail(ctx: HandlerContext, programId: string): Promise<void> {
    const { chatId, user } = ctx;

    const entry = getProgramById(programId);
    if (!entry) {
        await sendMessage(chatId, 'תוכנית לא נמצאה.');
        return;
    }

    const prog = entry.program;
    const admission = entry.admission;

    // Extract threshold
    let threshold = 'לא צוין';
    if (admission?.logic_rules?.OR?.[0]) {
        const firstPath = admission.logic_rules.OR[0] as any;
        if (firstPath.AND?.[0]?.label) {
            threshold = firstPath.AND[0].label;
        }
    }

    let msg = `🎓 <b>${prog.name}</b>\n`;
    msg += `🏛️ ${prog.institution?.name || 'לא ידוע'}\n`;
    msg += `📚 ${prog.degree_type} | ${prog.duration_years} שנים\n`;
    if (prog.faculty) msg += `📖 ${prog.faculty.name}\n`;
    msg += `\n📊 תנאי קבלה: ${threshold}\n`;

    // Check if user is tracking this program
    const isTracked = (user.tracked_programs || []).includes(programId);

    const buttons = [];
    buttons.push(keyboardRow(
        btn(isTracked ? '⭐ עוקב' : '☆ עקוב', `track:${programId}`),
        btn('📊 חשב סיכויים', 'cmd:calculate'),
    ));
    buttons.push(keyboardRow(btn('◀️ חזרה', 'cmd:programs')));

    await sendMessage(chatId, msg, { reply_markup: inlineKeyboard(buttons) });
    await logMessage(user.id, 'outgoing', 'program_detail', programId);
}

/**
 * Handle track/untrack program
 */
export async function handleTrackProgram(ctx: HandlerContext, programId: string): Promise<void> {
    const { user } = ctx;
    const tracked = [...(user.tracked_programs || [])];

    const isCurrentlyTracked = tracked.includes(programId);

    if (isCurrentlyTracked) {
        const updated = tracked.filter(id => id !== programId);
        await updateBotUser(user.id, { tracked_programs: updated } as any);
        await answerCallbackQuery(ctx.callbackQuery!.id, 'הוסר מהעקיבה');
    } else {
        tracked.push(programId);
        await updateBotUser(user.id, { tracked_programs: tracked } as any);
        await updateLeadScore(user, 'tracked_program');
        await answerCallbackQuery(ctx.callbackQuery!.id, 'נוסף לעקיבה!');
    }

    // Refresh the program detail view
    await handleProgramDetail(ctx, programId);
}
