-- Bot Users: Main table for Telegram bot users with conversation state machine
CREATE TABLE bot_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_chat_id TEXT UNIQUE NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,

    -- Conversation state machine
    conversation_state TEXT DEFAULT 'idle',
    state_data JSONB DEFAULT '{}'::JSONB,

    -- Academic profile (mirrors web app structure)
    sector TEXT,
    grades JSONB DEFAULT '[]'::JSONB,
    psychometric JSONB DEFAULT '{}'::JSONB,
    tracked_programs TEXT[] DEFAULT '{}',

    -- CRM / Lead data
    lead_score INTEGER DEFAULT 0,
    lead_stage TEXT DEFAULT 'new',
    web_user_id UUID,

    -- Referral system
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    referral_count INTEGER DEFAULT 0,

    -- Community
    rooms_joined TEXT[] DEFAULT '{}',

    -- Drip campaign
    drip_stage TEXT DEFAULT 'welcome',
    drip_last_sent_at TIMESTAMPTZ,

    -- Source tracking
    source TEXT DEFAULT 'organic',
    deep_link_program_id TEXT,

    -- Engagement tracking
    message_count INTEGER DEFAULT 0,
    commands_used TEXT[] DEFAULT '{}',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),

    -- Meta
    is_blocked BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_users_chat_id ON bot_users(telegram_chat_id);
CREATE INDEX idx_bot_users_lead_stage ON bot_users(lead_stage);
CREATE INDEX idx_bot_users_drip ON bot_users(drip_stage, drip_last_sent_at);
CREATE INDEX idx_bot_users_referral ON bot_users(referral_code);
CREATE INDEX idx_bot_users_web_user ON bot_users(web_user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_bot_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bot_users_updated_at
    BEFORE UPDATE ON bot_users
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_users_updated_at();

-- Bot Messages Log: Analytics and A/B testing
CREATE TABLE bot_messages_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_user_id UUID REFERENCES bot_users(id) ON DELETE CASCADE,
    direction TEXT NOT NULL,
    message_type TEXT,
    content TEXT,
    callback_data TEXT,
    campaign_id TEXT,
    variant TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bot_messages_user ON bot_messages_log(bot_user_id, created_at DESC);
CREATE INDEX idx_bot_messages_campaign ON bot_messages_log(campaign_id);
CREATE INDEX idx_bot_messages_type ON bot_messages_log(message_type);

-- Bot Groups: Managed Telegram rooms
CREATE TABLE bot_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_group_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    invite_link TEXT,
    linked_field TEXT,
    linked_program_id TEXT,
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    auto_moderate BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Campaigns: Broadcast and drip management
CREATE TABLE bot_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    segment_filter JSONB DEFAULT '{}'::JSONB,
    messages JSONB NOT NULL DEFAULT '[]'::JSONB,
    schedule JSONB,
    status TEXT DEFAULT 'draft',
    stats JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_campaigns ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by serverless functions)
CREATE POLICY "Service role full access on bot_users" ON bot_users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on bot_messages_log" ON bot_messages_log
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on bot_groups" ON bot_groups
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on bot_campaigns" ON bot_campaigns
    FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users can read bot_groups (for admin dashboard)
CREATE POLICY "Authenticated read on bot_groups" ON bot_groups
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read on bot_users" ON bot_users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read on bot_messages_log" ON bot_messages_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read on bot_campaigns" ON bot_campaigns
    FOR SELECT TO authenticated USING (true);
