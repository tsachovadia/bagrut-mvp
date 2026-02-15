import type { HandlerContext, WebProfileSummary } from '../types.js';
import { sendMessage, inlineKeyboard, keyboardRow, btn, urlBtn, webUrl } from '../client.js';
import { updateBotUser, logMessage, supabase } from '../middleware.js';
import { updateLeadScore } from '../services/lead-scoring.js';
import { setState } from '../services/user-service.js';
import { getUserByReferralCode, incrementReferralCount } from '../services/user-service.js';
import { linkBotToWeb } from '../../profile-linking.js';

/**
 * Handle /start command with variants:
 * /start          -> New user onboarding or returning user menu
 * /start {progId} -> Deep-link from program page
 * /start ref_{code} -> Referral tracking
 * /start link_{token} -> Web account linking via token
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

    // Handle web account linking via token
    if (payload?.startsWith('link_')) {
        const token = payload.replace('link_', '');
        await handleLinkToken(ctx, token);
        return;
    }

    // Handle return from website - show main menu
    if (payload === 'return') {
        if (user.web_user_id) {
            const profile = await getWebProfileSummary(user.web_user_id);
            await sendLinkedUserMenu(ctx, firstName, profile);
        } else {
            await sendUnlinkedReturningMenu(ctx, firstName);
        }
        return;
    }

    // Handle program deep-link
    if (payload && !payload.startsWith('ref_') && !payload.startsWith('link_')) {
        await handleProgramDeepLink(ctx, payload);
        return;
    }

    // Linked user → show profile summary
    if (user.web_user_id) {
        const profile = await getWebProfileSummary(user.web_user_id);
        await sendLinkedUserMenu(ctx, firstName, profile);
        return;
    }

    // Returning unlinked user
    if (isReturning) {
        await sendUnlinkedReturningMenu(ctx, firstName);
        return;
    }

    // New user onboarding
    await sendMessage(chatId,
        `היי ${firstName}! 👋\n\n` +
        `ברוכים הבאים ל<b>מתלבטים</b> - הקהילה הכי גדולה בישראל לתלמידים שמתקדמים ביחד.\n\n` +
        `באיזה מגזר אתה לומד/ת?`,
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
        `🎯 <b>הצעד הבא שלך:</b>\n` +
        `חשב את סיכויי הקבלה שלך לכל מוסד - לוקח 2 דקות!`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn('🚀 חשב סיכויים עכשיו!', webUrl())),
                keyboardRow(btn('👥 הצטרף לקהילה', 'cmd:rooms')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'sector_selected', sector);
}

/**
 * Linked user menu: pull data from web and show summary
 */
async function sendLinkedUserMenu(ctx: HandlerContext, firstName: string, profile: WebProfileSummary): Promise<void> {
    const { chatId, user } = ctx;

    let statusLine = '';
    if (profile.gradesCount > 0) {
        statusLine = `\n📝 ${profile.gradesCount} מקצועות`;
        if (profile.bagrutAvg) {
            statusLine += ` | ממוצע: <b>${profile.bagrutAvg.toFixed(1)}</b>`;
        }
        if (profile.psychoTotal) {
            statusLine += `\n🧠 פסיכומטרי: <b>${profile.psychoTotal}</b>`;
        }
    }

    const trackedCount = profile.trackedPrograms?.length || 0;
    if (trackedCount > 0) {
        statusLine += `\n🎯 עוקב אחרי ${trackedCount} תוכניות`;
    }

    await sendMessage(chatId,
        `היי ${firstName}! 👋${statusLine}\n\n🔗 החשבון שלך מחובר. מה תרצה לעשות?`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn('📊 דשבורד מלא באתר', webUrl('/dashboard'))),
                keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📤 שתף עם חברים', 'cmd:share')),
                keyboardRow(btn('📋 הפרופיל שלי', 'cmd:status')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'linked_menu');
}

/**
 * Returning unlinked user menu
 */
async function sendUnlinkedReturningMenu(ctx: HandlerContext, firstName: string): Promise<void> {
    const { chatId } = ctx;

    await sendMessage(chatId,
        `ברוך שובך ${firstName}! 👋\n\nמה תרצה לעשות?`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn('🌐 חשב סיכויים באתר', webUrl())),
                keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📤 שתף', 'cmd:share')),
                keyboardRow(btn('📋 סטטוס', 'cmd:status'), btn('❓ עזרה', 'cmd:help')),
            ]),
        }
    );

    await logMessage(ctx.user.id, 'outgoing', 'returning_menu');
}

/**
 * Handle program deep-link from web
 */
/**
 * Handle program deep-link from web
 */
async function handleProgramDeepLink(ctx: HandlerContext, programId: string): Promise<void> {
    const { chatId, user } = ctx;
    const cleanProgramId = programId.replace('program_', '');

    await updateBotUser(user.id, {
        deep_link_program_id: cleanProgramId,
        source: user.source === 'organic' ? 'web_program' : user.source,
    } as any);

    await updateLeadScore(user, 'deep_link_from_program');

    // 1. Resolve Cluster
    const { getClusterByProgramId } = await import('../clusters.js');
    const clusterId = getClusterByProgramId(cleanProgramId);

    // 2. Fetch linked Telegram Group for this cluster
    let group = null;
    if (clusterId) {
        const { data } = await supabase
            .from('bot_groups')
            .select('name, telegram_group_id, invite_link, is_forum, forum_topic_id')
            .eq('linked_field', clusterId)
            .single();
        group = data;
    } else {
        // Fallback: Try legacy lookup if cluster not found
        const { data } = await supabase
            .from('bot_groups')
            .select('name, telegram_group_id, invite_link, is_forum, forum_topic_id')
            .eq('linked_program_id', cleanProgramId)
            .single();
        group = data;
    }

    // 3. Fetch program details for the message
    const { data: program } = await supabase
        .from('programs')
        .select('name, degree_type, institutions ( name )')
        .eq('id', cleanProgramId)
        .single();

    const programName = program?.name || 'התואר';
    const institutionName = (program?.institutions as any)?.name || '';
    const fullName = `${programName} ${institutionName ? `ב${institutionName}` : ''}`;

    if (group) {
        let header = `👋 <b>ברוכים הבאים לקהילת ${programName}!</b>\n`;
        let text = `מצאנו את קבוצת הדיון המתאימה בול בשבילך (${group.name}).\nסטודנטים אמיתיים שילמדו איתך (או שנה מעליך) כבר מחכים שם.`;
        let btnText = `הצטרף לקהילה`;
        let link = group.invite_link;

        await sendMessage(chatId, header + '\n' + text, {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn(btnText, link || 'https://t.me/MitlabtimBot')),
                keyboardRow(urlBtn('🌐 חשב סיכויי קבלה', webUrl(`/program/${cleanProgramId}`))),
            ])
        });

        await logMessage(user.id, 'outgoing', 'deep_link_found_group', `${cleanProgramId} -> ${group.name}`);

    } else {
        // No specific group found -> Fallback to "Check Chances" or General Community
        await sendMessage(chatId,
            `היי ${user.first_name || ''}! 👋\n\n` +
            `ראינו שאת/ה מתעניין ב<b>${fullName}</b>.\n` +
            `עדיין לא פתחנו קבוצה ספציפית לתואר הזה, אבל הקהילה הכללית שלנו תשמח לעזור!`,
            {
                reply_markup: inlineKeyboard([
                    keyboardRow(urlBtn('🌐 בדוק סיכויי קבלה', webUrl(`/program/${cleanProgramId}`))),
                    keyboardRow(btn('👥 כניסה לקהילה הכללית', 'cmd:rooms')),
                ]),
            }
        );
        await logMessage(user.id, 'outgoing', 'deep_link_no_group', cleanProgramId);
    }
}

/**
 * Handle token-based account linking
 */
async function handleLinkToken(ctx: HandlerContext, token: string): Promise<void> {
    const { chatId, user } = ctx;

    // Resolve token
    const { data: tokenRow } = await supabase
        .from('bot_link_tokens')
        .select('web_user_id')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (!tokenRow) {
        await sendMessage(chatId,
            '❌ הלינק פג תוקף או כבר נוצל.\nנסה ליצור לינק חדש מהאתר.'
        );
        return;
    }

    // Mark token as used
    await supabase
        .from('bot_link_tokens')
        .update({ used: true })
        .eq('token', token);

    // Link profiles
    const webUserId = tokenRow.web_user_id;
    await updateBotUser(user.id, { web_user_id: webUserId, source: 'web' } as any);
    await linkBotToWeb(user.id, webUserId);
    await updateLeadScore(user, 'linked_account');

    // Fetch and show profile summary
    const profile = await getWebProfileSummary(webUserId);

    let summaryLine = '';
    if (profile.gradesCount > 0) {
        summaryLine = `\n📝 ${profile.gradesCount} מקצועות`;
        if (profile.bagrutAvg) summaryLine += ` | ממוצע: ${profile.bagrutAvg.toFixed(1)}`;
    }

    await sendMessage(chatId,
        `🔗 <b>החשבון חובר בהצלחה!</b>${summaryLine}\n\n` +
        `מעכשיו תקבל/י עדכונים אישיים ישירות לכאן.`,
        {
            reply_markup: inlineKeyboard([
                keyboardRow(urlBtn('📊 דשבורד מלא באתר', webUrl('/dashboard'))),
                keyboardRow(btn('👥 חדרי לימוד', 'cmd:rooms'), btn('📋 הפרופיל שלי', 'cmd:status')),
            ]),
        }
    );

    await logMessage(user.id, 'outgoing', 'link_confirm');
}

/**
 * Handle referral tracking
 */
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

/**
 * Pull user's academic data from user_profiles (web app DB)
 */
export async function getWebProfileSummary(webUserId: string): Promise<WebProfileSummary> {
    const { data } = await supabase
        .from('user_profiles')
        .select('bagrut_grades, bagrut_avg_raw, psycho_score_total, tracked_programs, journey_stage')
        .eq('id', webUserId)
        .single();

    if (!data) {
        return { gradesCount: 0, bagrutAvg: null, psychoTotal: null, trackedPrograms: [], journeyStage: null };
    }

    const grades = data.bagrut_grades as any[] | null;

    return {
        gradesCount: Array.isArray(grades) ? grades.length : 0,
        bagrutAvg: data.bagrut_avg_raw || null,
        psychoTotal: data.psycho_score_total || null,
        trackedPrograms: data.tracked_programs || [],
        journeyStage: data.journey_stage || null,
    };
}
