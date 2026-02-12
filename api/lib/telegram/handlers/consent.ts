import type { HandlerContext } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn, urlBtn } from '../client.js';
import { updateBotUser, logMessage } from '../middleware.js';

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://mitlabtim.co.il';

/**
 * Handle /consent command - show and manage consent preferences
 */
export async function handleConsent(ctx: HandlerContext): Promise<void> {
    const { chatId, user } = ctx;

    await logMessage(user.id, 'incoming', 'command', '/consent');

    const marketingStatus = user.consent_marketing ? '✅' : '❌';

    await sendMessage(chatId,
        `<b>הגדרות פרטיות</b>\n\n` +
        `${marketingStatus} קבלת עדכונים והמלצות\n\n` +
        `אנחנו אוספים את הנתונים שלך כדי:\n` +
        `• לחשב את סיכויי הקבלה שלך\n` +
        `• להתאים לך תוכניות ומסלולים\n` +
        `• לשלוח לך עדכונים רלוונטיים\n\n` +
        `<a href="https://mitlabtim.co.il/terms">תנאי שימוש מלאים</a>`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(
                    user.consent_marketing
                        ? btn('❌ בטל עדכונים', 'consent:disable_marketing')
                        : btn('✅ אשר עדכונים', 'consent:enable_marketing')
                ),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'consent_menu');
}

/**
 * Handle consent callback buttons
 */
export async function handleConsentCallback(ctx: HandlerContext, action: string): Promise<void> {
    const { chatId, user } = ctx;

    const returnButtons = user.web_user_id
        ? [keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('🏠 תפריט ראשי', 'cmd:start'))]
        : [
            keyboardRow(urlBtn('🌐 חשב סיכויים באתר', WEB_APP_URL)),
            keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('🏠 תפריט ראשי', 'cmd:start')),
        ];

    if (action === 'enable_marketing') {
        await updateBotUser(user.id, {
            consent_marketing: true,
            consent_given_at: new Date().toISOString(),
        } as any);

        await sendMessage(chatId,
            `✅ מעולה! תקבל/י עדכונים והמלצות מותאמות אישית.\n\nתוכל/י לשנות בכל עת עם /consent`,
            { reply_markup: inlineKeyboard(returnButtons) }
        );
    } else if (action === 'disable_marketing') {
        await updateBotUser(user.id, {
            consent_marketing: false,
        } as any);

        await sendMessage(chatId,
            `❌ עדכונים בוטלו. לא נשלח לך הודעות שיווקיות.\n\nתוכל/י לשנות בכל עת עם /consent`,
            { reply_markup: inlineKeyboard(returnButtons) }
        );
    }

    await logMessage(user.id, 'outgoing', 'consent_updated', action);
}
