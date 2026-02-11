// ============================
// Conversation State Machine
// ============================

export type ConversationState =
    | 'idle'
    | 'onboarding_sector'
    | 'grade_entry_subject'
    | 'grade_entry_units'
    | 'grade_entry_score'
    | 'psychometric_general'
    | 'psychometric_quant'
    | 'psychometric_verbal'
    | 'psychometric_english'
    | 'program_browsing'
    | 'awaiting_text_input';

export type LeadStage = 'new' | 'engaged' | 'grade_entered' | 'simulated' | 'high_intent';

export type DripStage =
    | 'welcome'
    | 'nudge_grades'
    | 'partial_grades'
    | 'nudge_psycho'
    | 'first_results'
    | 'track_programs'
    | 'community'
    | 'share'
    | 're_engage'
    | 'completed';

// ============================
// Bot User (maps to bot_users table)
// ============================

export interface BotUser {
    id: string;
    telegram_chat_id: string;
    telegram_username: string | null;
    first_name: string | null;
    last_name: string | null;
    conversation_state: ConversationState;
    state_data: Record<string, any>;
    sector: string | null;
    grades: SubjectGradeBot[];
    psychometric: PsychometricBot;
    tracked_programs: string[];
    lead_score: number;
    lead_stage: LeadStage;
    web_user_id: string | null;
    referral_code: string;
    referred_by: string | null;
    referral_count: number;
    rooms_joined: string[];
    drip_stage: DripStage;
    drip_last_sent_at: string | null;
    source: string;
    deep_link_program_id: string | null;
    message_count: number;
    commands_used: string[];
    last_active_at: string;
    is_blocked: boolean;
    consent_marketing: boolean;
    consent_given_at: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// Lightweight grade type for bot storage (mirrors SubjectGrade from calculator.ts)
export interface SubjectGradeBot {
    id: string;
    subject: string;
    units: number;
    grade: number;
}

export interface PsychometricBot {
    general: number;
    quantitative: number;
    verbal: number;
    english: number;
    total?: number;
}

// ============================
// Telegram API Types
// ============================

export interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
    callback_query?: TelegramCallbackQuery;
    my_chat_member?: any;
    edited_message?: TelegramMessage;
}

export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    new_chat_members?: TelegramUser[];
    left_chat_member?: TelegramUser;
}

export interface TelegramCallbackQuery {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
}

export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
}

export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
}

export interface InlineKeyboardButton {
    text: string;
    callback_data?: string;
    url?: string;
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}

export interface SendMessageOptions {
    reply_markup?: InlineKeyboardMarkup;
    parse_mode?: 'HTML' | 'Markdown';
    disable_web_page_preview?: boolean;
}

// ============================
// Handler Context
// ============================

export interface HandlerContext {
    chatId: number;
    user: BotUser;
    message?: TelegramMessage;
    callbackQuery?: TelegramCallbackQuery;
}

// ============================
// Lead Scoring Actions
// ============================

export type LeadAction =
    | 'started_bot'
    | 'selected_sector'
    | 'entered_first_grade'
    | 'entered_3_grades'
    | 'entered_psychometric'
    | 'ran_calculation'
    | 'tracked_program'
    | 'deep_link_from_program'
    | 'joined_room'
    | 'used_referral'
    | 'daily_active';
