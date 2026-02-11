import type { HandlerContext } from '../types';
import { sendMessage, inlineKeyboard, keyboardRow, btn } from '../client';
import { updateBotUser, logMessage } from '../middleware';
import { updateLeadScore } from '../services/lead-scoring';
import { setState } from '../services/user-service';
import { getUserByReferralCode, incrementReferralCount } from '../services/user-service';
import { ALL_PROGRAMS } from '../../shared/programs';
import { linkBotToWeb } from '../../profile-linking';

/**
 * Handle /start command with variants:
 * /start          → New user onboarding or returning user menu
 * /start {progId} → Deep-link from program page
 * /start ref_{code} → Referral tracking
 * /start link_{userId} → Web account linking
 */
export async function handleStart(ctx: HandlerContext, payload?: string): Promise<void> {
    const { chatId, user } = ctx;
    const firstName = user.first_name || 'חבר/ה';
    const isReturning = user.message_count > 1 || user.lead_score > 5;

    await logMessage(user.id, 'incoming', 'command', `/start ${payload || ''}`);

    // Handle referral deep-link
    if (payload?.startsWith('ref_')) {
        const referralCode = payload.replace('ref_', '');
        await handleReferral(ctx, referralCode);
    }

    // Handle web account linking
    if (payload?.startsWith('link_')) {
        const webUserId = payload.replace('link_', '');
        await updateBotUser(user.id, { web_user_id: webUserId, source: 'web' } as any);
        // Also create profile_links entries for unified profile tracking
        await linkBotToWeb(user.id, webUserId);
        await sendMessage(chatId,
            `🔗 החשבון חובר בהצלחה!\n\nהציונים שלך מהאתר יסונכרנו אוטומטית.\nתקבל/י עדכונים ישירות לכאן.`
        );
        await logMessage(user.id, 'outgoing', 'link_confirm');
        return;
    }

    // Handle program deep-link
    if (payload && !payload.startsWith('ref_') && !payload.startsWith('link_')) {
        await handleProgramDeepLink(ctx, payload);
        return;
    }

    // Returning user
    if (isReturning) {
        await sendReturningUserMenu(ctx, firstName);
        return;
    }

    // New user onboarding
    await sendMessage(chatId,
        `היי ${firstName}! 👋\n\n` +
        `ברוכים הבאים ל<b>מתלבטים</b> - הכלי שעוזר לך לדעת לאיפה תתקבל.\n\n` +
        `בוא נתחיל! באיזה מגזר אתה לומד/ת?`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(btn('ממלכתי', 'sector:mamlachti'), btn('ממלכתי-דתי', 'sector:mamlachti_dati')),
                keyboardRow(btn('ערבי', 'sector:arab'), btn('דרוזי', 'sector:druze')),
            ]),
        }
    );

    await setState(user.id, 'onboarding_sector');
    await updateLeadScore(user, 'started_bot');
    await logMessage(user.id, 'outgoing', 'onboarding_welcome');
}

/**
 * Handle sector selection callback
 */
export async function handleSectorSelection(ctx: HandlerContext, sector: string): Promise<void> {
    const { chatId, user } = ctx;

    await updateBotUser(user.id, {
        sector,
        conversation_state: 'idle',
        state_data: {},
    } as any);

    await updateLeadScore(user, 'selected_sector');

    const sectorNames: Record<string, string> = {
        mamlachti: 'ממלכתי',
        mamlachti_dati: 'ממלכתי-דתי',
        arab: 'ערבי',
        druze: 'דרוזי',
    };

    await sendMessage(chatId,
        `מעולה! מגזר: <b>${sectorNames[sector] || sector}</b>\n\n` +
        `מה תרצה לעשות?`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(btn('📝 הזן ציונים', 'cmd:grades'), btn('🔍 חפש תוכניות', 'cmd:programs')),
                keyboardRow(btn('👥 הצטרף לקהילה', 'cmd:rooms'), btn('❓ עזרה', 'cmd:help')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'sector_selected', sector);
}

async function handleProgramDeepLink(ctx: HandlerContext, programId: string): Promise<void> {
    const { chatId, user } = ctx;

    await updateBotUser(user.id, {
        deep_link_program_id: programId,
        source: user.source === 'organic' ? 'web' : user.source,
    } as any);

    await updateLeadScore(user, 'deep_link_from_program');

    const programEntry = ALL_PROGRAMS.find(p => p.program.id === programId);

    if (programEntry) {
        const prog = programEntry.program;
        const admission = programEntry.admission;

        // Extract threshold for display
        let threshold = '';
        if (admission?.logic_rules?.OR?.[0]) {
            const firstPath = admission.logic_rules.OR[0] as any;
            if (firstPath.AND?.[0]?.value) {
                threshold = `\n📊 סף קבלה משוער: <b>${firstPath.AND[0].value}</b> (${firstPath.AND[0].label || firstPath.AND[0].type})`;
            }
        }

        await sendMessage(chatId,
            `🎓 <b>${prog.name}</b>\n` +
            `🏛️ ${prog.institution?.name || 'לא ידוע'}\n` +
            `📚 ${prog.degree_type} | ${prog.duration_years} שנים` +
            threshold +
            `\n\nרוצה לבדוק אם תתקבל? הזן את הציונים שלך!`,
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(btn('📝 הזן ציונים', 'cmd:grades'), btn('📊 חשב תוצאות', 'cmd:calculate')),
                    keyboardRow(btn('🌐 לאתר התוכנית', 'cmd:noop')),
                ]),
            }
        );
    } else {
        await sendMessage(chatId,
            `היי ${user.first_name || ''}! 👋\n\nרוצה לבדוק את סיכויי הקבלה שלך?\nבוא נתחיל!`,
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(btn('📝 הזן ציונים', 'cmd:grades'), btn('🔍 חפש תוכניות', 'cmd:programs')),
                ]),
            }
        );
    }

    await logMessage(user.id, 'outgoing', 'deep_link', programId);
}

async function handleReferral(ctx: HandlerContext, referralCode: string): Promise<void> {
    const { user } = ctx;

    if (user.referred_by) return; // Already referred

    const referrer = await getUserByReferralCode(referralCode);
    if (referrer && referrer.id !== user.id) {
        await updateBotUser(user.id, {
            referred_by: referralCode,
            source: 'referral',
        } as any);

        await incrementReferralCount(referrer.id);

        // Notify referrer
        try {
            await sendMessage(
                parseInt(referrer.telegram_chat_id),
                `🎉 ${user.first_name || 'מישהו'} הצטרף/ה דרך ההזמנה שלך!\nסה״כ הזמנת: ${(referrer.referral_count || 0) + 1} חברים`
            );
        } catch {
            // Referrer might have blocked the bot
        }
    }
}

async function sendReturningUserMenu(ctx: HandlerContext, firstName: string): Promise<void> {
    const { chatId, user } = ctx;
    const gradesCount = Array.isArray(user.grades) ? user.grades.length : 0;

    let statusLine = '';
    if (gradesCount > 0) {
        statusLine = `\n📝 ${gradesCount} מקצועות מוזנים`;
        if (user.psychometric?.general) {
            statusLine += ` | 🧠 פסיכומטרי: ${user.psychometric.general}`;
        }
    }

    await sendMessage(chatId,
        `ברוך שובך ${firstName}! 👋${statusLine}\n\nמה תרצה לעשות?`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(btn('📝 ציונים', 'cmd:grades'), btn('📊 חשב תוצאות', 'cmd:calculate')),
                keyboardRow(btn('🔍 תוכניות', 'cmd:programs'), btn('👥 קהילה', 'cmd:rooms')),
                keyboardRow(btn('📋 הפרופיל שלי', 'cmd:status'), btn('📤 שתף', 'cmd:share')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'returning_menu');
}
