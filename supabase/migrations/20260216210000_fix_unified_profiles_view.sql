-- Fix unified_profiles view: replace NULL placeholders with actual columns
-- from user_profiles (temperature, gap_analysis, lead_routing_tags)
-- and bot_users (sector)

DROP VIEW IF EXISTS unified_profiles;

CREATE OR REPLACE VIEW unified_profiles AS
SELECT
    COALESCE(u.id, b.web_user_id, b.id) as canonical_id,
    COALESCE(
        NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), ''),
        b.first_name || ' ' || COALESCE(b.last_name, ''),
        b.telegram_username,
        'Anonymous'
    ) as display_name,
    COALESCE(u.email_primary, u.id::text) as email,
    u.phone_primary as phone,
    b.telegram_chat_id,
    b.telegram_username,
    u.bagrut_grades,
    u.bagrut_avg_raw,
    u.psycho_score_total as psycho_total,
    u.psycho_score_quant as psycho_quant,
    u.psycho_score_eng as psycho_eng,
    b.sector,
    GREATEST(u.lead_score, b.lead_score) as lead_score,
    COALESCE(u.journey_stage, u.lead_stage) as journey_stage,
    u.temperature,
    u.gap_analysis,
    u.lead_routing_tags,
    u.updated_at as web_last_active,
    b.last_active_at as bot_last_active,
    b.message_count as bot_messages,
    COALESCE(u.tracked_programs, b.tracked_programs) as tracked_programs,
    u.id as web_profile_id,
    b.id as bot_user_id,
    CASE WHEN u.id IS NOT NULL AND b.web_user_id IS NOT NULL THEN true ELSE false END as is_linked,
    LEAST(u.created_at, b.created_at) as first_seen
FROM
    user_profiles u
FULL OUTER JOIN
    bot_users b ON u.id = b.web_user_id;

GRANT SELECT ON unified_profiles TO authenticated;
GRANT SELECT ON unified_profiles TO service_role;
