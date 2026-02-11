-- ============================================================
-- Unified Profiles: Link multiple identity sources per student
-- ============================================================

-- 1. Profile Links table: maps web, telegram, soft_lead, facebook_lead to one canonical person
CREATE TABLE IF NOT EXISTS profile_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id UUID NOT NULL,
    source_type TEXT NOT NULL,       -- 'web', 'telegram', 'soft_lead', 'facebook_lead'
    source_id TEXT NOT NULL,         -- The ID in the source table
    confidence FLOAT DEFAULT 1.0,   -- 1.0 = confirmed link, 0.5-0.9 = auto-matched
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    linked_by TEXT DEFAULT 'system', -- 'system', 'manual', 'user_action'
    UNIQUE(source_type, source_id)
);

CREATE INDEX idx_profile_links_canonical ON profile_links(canonical_id);
CREATE INDEX idx_profile_links_source ON profile_links(source_type, source_id);

-- RLS
ALTER TABLE profile_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on profile_links" ON profile_links
    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on profile_links" ON profile_links
    FOR SELECT TO authenticated USING (true);

-- 2. Extend user_profiles with consent, gap analysis, routing, journey tracking
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS consent_partners BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS consent_source TEXT,
    ADD COLUMN IF NOT EXISTS gap_analysis JSONB DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS lead_routing_tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS temperature TEXT DEFAULT 'cold',
    ADD COLUMN IF NOT EXISTS journey_stage TEXT DEFAULT 'anonymous';

CREATE INDEX IF NOT EXISTS idx_user_profiles_temperature ON user_profiles(temperature);
CREATE INDEX IF NOT EXISTS idx_user_profiles_journey ON user_profiles(journey_stage);

-- 3. Extend bot_users with consent columns
ALTER TABLE bot_users
    ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;

-- 4. Add link from soft_leads to user_profiles
ALTER TABLE soft_leads
    ADD COLUMN IF NOT EXISTS user_profile_id UUID;

-- 5. Unified Profile VIEW
-- FULL OUTER JOIN: shows web-only, bot-only, AND linked users in one view
CREATE OR REPLACE VIEW unified_profiles AS
SELECT
    COALESCE(up.id, bu.web_user_id) AS canonical_id,
    -- Identity
    COALESCE(up.first_name, bu.first_name) AS display_name,
    up.last_name,
    up.email_primary AS email,
    up.phone_primary AS phone,
    bu.telegram_chat_id,
    bu.telegram_username,
    -- Academic (prefer web data, fallback to bot)
    COALESCE(up.bagrut_grades, bu.grades) AS bagrut_grades,
    up.bagrut_avg_raw,
    COALESCE(up.psycho_score_total, (bu.psychometric->>'general')::NUMERIC) AS psycho_total,
    COALESCE(up.psycho_score_quant, (bu.psychometric->>'quantitative')::NUMERIC) AS psycho_quant,
    COALESCE(up.psycho_score_eng, (bu.psychometric->>'english')::NUMERIC) AS psycho_eng,
    bu.sector,
    -- CRM: take the higher lead score
    GREATEST(COALESCE(up.lead_score, 0), COALESCE(bu.lead_score::NUMERIC, 0)) AS lead_score,
    COALESCE(
        CASE WHEN COALESCE(up.lead_score, 0) >= COALESCE(bu.lead_score::NUMERIC, 0)
             THEN up.lead_stage ELSE bu.lead_stage END,
        'new'
    ) AS lead_stage,
    up.temperature,
    up.journey_stage,
    up.gap_analysis,
    up.lead_routing_tags,
    -- Behavior
    up.app_calculator_uses,
    up.app_last_active AS web_last_active,
    bu.last_active_at AS bot_last_active,
    bu.message_count AS bot_messages,
    bu.commands_used AS bot_commands,
    bu.rooms_joined,
    bu.drip_stage,
    bu.drip_last_sent_at,
    -- Referral
    bu.referral_code,
    bu.referred_by,
    bu.referral_count,
    -- Source
    COALESCE(up.source, bu.source, 'unknown') AS primary_source,
    up.campaign_id,
    -- Consent
    COALESCE(up.consent_marketing, bu.consent_marketing, FALSE) AS consent_marketing,
    COALESCE(up.consent_partners, FALSE) AS consent_partners,
    up.consent_given_at,
    -- Preferences
    up.institution_pref,
    up.major_subjects AS field_preferences,
    up.target_degree_1,
    up.target_degree_2,
    COALESCE(up.tracked_programs, bu.tracked_programs) AS tracked_programs,
    -- Personal
    up.age_range,
    up.gender,
    up.location_city,
    up.military_status,
    up.scholarship_needed,
    up.budget_estimation,
    -- Timestamps
    LEAST(up.created_at, bu.created_at) AS first_seen,
    GREATEST(up.updated_at, bu.updated_at) AS last_updated,
    -- Source IDs for linking back
    up.id AS web_profile_id,
    bu.id AS bot_user_id,
    -- Computed: has both channels linked
    (up.id IS NOT NULL AND bu.id IS NOT NULL) AS is_linked
FROM user_profiles up
FULL OUTER JOIN bot_users bu ON bu.web_user_id = up.id;
