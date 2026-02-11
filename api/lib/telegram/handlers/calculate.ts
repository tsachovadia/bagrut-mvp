import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn } from '../client.js';
import { logMessage } from '../middleware.js';
import { updateLeadScore } from '../services/lead-scoring.js';
import { calculateForBot, calculateSekem, type Sector } from '../../shared/calculator.js';
import { ALL_PROGRAMS } from '../../shared/programs.js';

/**
 * Handle /calculate command - run full admission simulation
 */
export async function handleCalculate(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    // Validate prerequisites
    if (!Array.isArray(user.grades) || user.grades.length === 0) {
        await sendMessage(chatId,
            '❌ אין ציוני בגרות להזנה.\nשלח /grades כדי להזין ציונים.',
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(btn('📝 הזן ציונים', 'cmd:grades')),
                ]),
            }
        );
        return;
    }

    // Determine which programs to check
    let programsToCheck = ALL_PROGRAMS;
    const trackedIds = user.tracked_programs || [];

    // Get psychometric data
    const psychometric = {
        general: user.psychometric?.general || 0,
        quantitative: user.psychometric?.quantitative || 0,
        verbal: user.psychometric?.verbal || 0,
        english: user.psychometric?.english || 0,
        total: user.psychometric?.total || user.psychometric?.general || 0,
    };

    // Run calculation
    const result = calculateForBot(
        user.grades,
        psychometric,
        (user.sector as Sector) || undefined,
        programsToCheck
    );

    // Calculate university-specific sekem
    const sekem = calculateSekem(result.bagrutAverage, psychometric.total || psychometric.general || 550);

    // Build result message
    let msg = `📊 <b>תוצאות החישוב</b>\n\n`;
    msg += `📝 ממוצע בגרות (מותאם): <b>${result.bagrutAverage.toFixed(1)}</b>\n`;

    if (psychometric.general > 0) {
        msg += `🧠 פסיכומטרי: <b>${psychometric.general}</b>\n`;
    }

    msg += `\n🏛️ <b>סכמי קבלה:</b>\n`;
    if (sekem.technion > 0) msg += `• טכניון: <b>${sekem.technion.toFixed(1)}</b>\n`;
    if (sekem.tau > 0) msg += `• תל אביב: <b>${sekem.tau.toFixed(1)}</b>\n`;
    if (sekem.bgu > 0) msg += `• בן-גוריון: <b>${sekem.bgu.toFixed(1)}</b>\n`;
    if (sekem.huji > 0) msg += `• העברית: <b>${sekem.huji.toFixed(1)}</b>\n`;

    // Show tracked programs status
    if (trackedIds.length > 0) {
        const trackedResults = result.programResults.filter(p => trackedIds.includes(p.programId));
        if (trackedResults.length > 0) {
            msg += `\n🎯 <b>התוכניות שלך:</b>\n`;
            for (const prog of trackedResults) {
                const icon = prog.isReachable ? '✅' : '❌';
                msg += `${icon} ${prog.programName} (${prog.university})`;
                if (!prog.isReachable && prog.thresholdDisplay !== 'לא צוין') {
                    msg += ` - סף: ${prog.thresholdDisplay}`;
                }
                msg += '\n';
            }
        }
    }

    // Show top reachable programs (max 5)
    const reachable = result.programResults.filter(p => p.isReachable && !trackedIds.includes(p.programId));

    if (reachable.length > 0) {
        msg += `\n✅ <b>תוכניות פתוחות (${reachable.length}):</b>\n`;
        for (const prog of reachable.slice(0, 5)) {
            msg += `• ${prog.programName} - ${prog.university}\n`;
        }
        if (reachable.length > 5) {
            msg += `...ועוד ${reachable.length - 5} תוכניות\n`;
        }
    }

    // Improvement tip
    const hasMath5 = user.grades.some((g: any) => g.subject === 'מתמטיקה' && g.units === 5);
    if (!hasMath5) {
        const hasMath = user.grades.find((g: any) => g.subject === 'מתמטיקה');
        if (hasMath && hasMath.units < 5) {
            msg += `\n💡 <b>טיפ:</b> שדרוג מתמטיקה ל-5 יח״ל יעלה את הממוצע בכ-8+ נקודות!`;
        }
    }

    await sendMessage(chatId, msg, {
        reply_markup: inlineKeyboard([
            keyboardRow(btn('📝 שנה ציונים', 'cmd:grades'), btn('🔍 חפש תוכניות', 'cmd:programs')),
            keyboardRow(btn('📤 שתף תוצאות', 'cmd:share'), btn('👥 הצטרף לחדר', 'cmd:rooms')),
        ]),
    });

    await updateLeadScore(user, 'ran_calculation');
    await logMessage(user.id, 'outgoing', 'calculation_result', `avg:${result.bagrutAverage.toFixed(1)}`);
}
