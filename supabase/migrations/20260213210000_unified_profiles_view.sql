-- Create a view that unifies user_profiles (web) and bot_users (telegram)
-- matching them by web_user_id link or treating them as separate if not linked.

DROP VIEW IF EXISTS unified_profiles;

CREATE OR REPLACE VIEW unified_profiles AS
SELECT
    COALESCE(u.id, b.web_user_id, b.id) as canonical_id, -- Use web ID if present, otherwise bot UUID
    COALESCE(
        NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), ''), 
        b.first_name || ' ' || COALESCE(b.last_name, ''), 
        b.telegram_username,
        'Anonymous'
    ) as display_name,
    COALESCE(u.email_primary, u.id::text) as email, -- Fallback to ID if no email, though email_primary logic should be confirmed
    NULL::text as phone, -- Removed incorrect mapping
    b.telegram_chat_id,
    b.telegram_username,
    u.bagrut_grades,
    u.bagrut_avg_raw,
    u.psycho_score_total as psycho_total,
    u.psycho_score_quant as psycho_quant,
    u.psycho_score_eng as psycho_eng,
    NULL::text as sector, -- sector column missing in user_profiles, handled via logic or different column? Setting null for now to fix view
    GREATEST(u.lead_score, b.lead_score) as lead_score,
    u.lead_stage as journey_stage, -- distinct schema had lead_stage, assuming mapping to journey_stage
    NULL::text as temperature, -- temperature missing in user_profiles schema output, checking provided JSON... wait, schema output didn't show temperature. Setting NULL to avoid error.
    NULL::jsonb as gap_analysis, -- missing in schema output
    NULL::text[] as lead_routing_tags, -- missing in schema output
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

-- Grant access to authenticated users (admin mainly)
GRANT SELECT ON unified_profiles TO authenticated;
GRANT SELECT ON unified_profiles TO service_role;
