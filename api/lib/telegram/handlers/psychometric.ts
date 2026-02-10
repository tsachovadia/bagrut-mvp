import type { HandlerContext, PsychometricBot } from '../types';
import { sendMessage, inlineKeyboard, keyboardRow, btn } from '../client';
import { updateBotUser, logMessage } from '../middleware';
import { setState } from '../services/user-service';
import { updateLeadScore } from '../services/lead-scoring';

/**
 * Start psychometric score entry flow
 */
export async function handlePsychometric(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    const existing = user.psychometric;
    if (existing?.general > 0) {
        await sendMessage(chatId,
            `🧠 <b>ציונים פסיכומטריים קיימים:</b>\n` +
            `כללי: ${existing.general}\n` +
            `כמותי: ${existing.quantitative}\n` +
            `מילולי: ${existing.verbal}\n` +
            `אנגלית: ${existing.english}\n\n` +
            `רוצה לעדכן?`,
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(btn('עדכן ציונים', 'psycho_restart'), btn('השאר כך', 'cmd:calculate')),
                ]),
            }
        );
        return;
    }

    await setState(user.id, 'psychometric_general');

    await sendMessage(chatId,
        `🧠 <b>הזנת ציונים פסיכומטריים</b>\n\n` +
        `מה הציון ה<b>כללי</b> שלך? (200-800)\n` +
        `(אם אין לך ציון עדיין, שלח 0 לדלג)`
    );

    await logMessage(user.id, 'outgoing', 'psycho_start');
}

/**
 * Handle psychometric score text input based on current state
 */
export async function handlePsychometricScore(ctx: HandlerContext, scoreText: string): Promise<void> {
    const { chatId, user } = ctx;
    const state = user.conversation_state;

    const score = parseInt(scoreText, 10);

    // Allow 0 to skip, or valid range 200-800
    if (isNaN(score) || (score !== 0 && (score < 200 || score > 800))) {
        await sendMessage(chatId, '❌ ציון לא תקין. שלח מספר בין 200 ל-800, או 0 לדלג.');
        return;
    }

    const currentPsycho: PsychometricBot = {
        general: user.psychometric?.general || 0,
        quantitative: user.psychometric?.quantitative || 0,
        verbal: user.psychometric?.verbal || 0,
        english: user.psychometric?.english || 0,
    };

    switch (state) {
        case 'psychometric_general':
            currentPsycho.general = score;
            await updateBotUser(user.id, { psychometric: currentPsycho } as any);
            await setState(user.id, 'psychometric_quant');
            await sendMessage(chatId,
                score > 0
                    ? `✅ כללי: <b>${score}</b>\n\nמה הציון ה<b>כמותי</b> שלך? (200-800, או 0 לדלג)`
                    : `מה הציון ה<b>כמותי</b> שלך? (200-800, או 0 לדלג)`
            );
            break;

        case 'psychometric_quant':
            currentPsycho.quantitative = score;
            await updateBotUser(user.id, { psychometric: currentPsycho } as any);
            await setState(user.id, 'psychometric_verbal');
            await sendMessage(chatId,
                `${score > 0 ? `✅ כמותי: <b>${score}</b>\n\n` : ''}מה הציון ה<b>מילולי</b> שלך? (200-800, או 0 לדלג)`
            );
            break;

        case 'psychometric_verbal':
            currentPsycho.verbal = score;
            await updateBotUser(user.id, { psychometric: currentPsycho } as any);
            await setState(user.id, 'psychometric_english');
            await sendMessage(chatId,
                `${score > 0 ? `✅ מילולי: <b>${score}</b>\n\n` : ''}מה הציון ב<b>אנגלית</b>? (50-150, או 0 לדלג)`
            );
            break;

        case 'psychometric_english': {
            // English has different scale (50-150)
            if (score !== 0 && (score < 50 || score > 150)) {
                await sendMessage(chatId, '❌ ציון אנגלית לא תקין. שלח מספר בין 50 ל-150, או 0 לדלג.');
                return;
            }
            currentPsycho.english = score;
            // Calculate total
            currentPsycho.total = currentPsycho.general || (
                currentPsycho.quantitative + currentPsycho.verbal > 0
                    ? Math.round((currentPsycho.quantitative + currentPsycho.verbal) / 2 * 3.5)
                    : 0
            );

            await updateBotUser(user.id, {
                psychometric: currentPsycho,
                conversation_state: 'idle',
                state_data: {},
            } as any);

            await updateLeadScore(user, 'entered_psychometric');

            // Show summary
            let summary = `🧠 <b>ציונים פסיכומטריים נשמרו:</b>\n`;
            if (currentPsycho.general > 0) summary += `כללי: ${currentPsycho.general}\n`;
            if (currentPsycho.quantitative > 0) summary += `כמותי: ${currentPsycho.quantitative}\n`;
            if (currentPsycho.verbal > 0) summary += `מילולי: ${currentPsycho.verbal}\n`;
            if (currentPsycho.english > 0) summary += `אנגלית: ${currentPsycho.english}\n`;

            const hasGrades = Array.isArray(user.grades) && user.grades.length > 0;

            await sendMessage(chatId,
                summary + `\n${hasGrades ? 'מוכן לחישוב!' : 'עכשיו הזן ציוני בגרות.'}`,
                {
                    reply_markup: inlineKeyboard([
                        hasGrades
                            ? keyboardRow(btn('📊 חשב תוצאות', 'cmd:calculate'))
                            : keyboardRow(btn('📝 הזן ציונים', 'cmd:grades')),
                    ]),
                }
            );

            await logMessage(user.id, 'outgoing', 'psycho_done');
            break;
        }
    }
}
