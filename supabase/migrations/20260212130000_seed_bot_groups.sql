-- Migration: Seed starter rooms (Placeholders)
-- Note: Replace 'TBD_*' values with real Telegram Group IDs and Invite Links

INSERT INTO bot_groups (telegram_group_id, name, type, invite_link, description, field_tags, is_active, auto_moderate)
VALUES
    ('TBD_GENERAL', 'מתלבטים - הקהילה', 'general', 'https://t.me/+TBD_GENERAL', 'קבוצה כללית לשאלות ודיונים', '{}', true, true),
    ('TBD_CS', 'CS והנדסה - מתלבטים', 'field', 'https://t.me/+TBD_CS', 'לכל מי שמעוניין בהנדסה ומדעי המחשב', '{computer_science,engineering}', true, true),
    ('TBD_2026', 'נרשמים 2026 - מתלבטים', 'stage', 'https://t.me/+TBD_2026', 'למתכננים להתחיל לימודים ב-2026', '{}', true, true)
ON CONFLICT (telegram_group_id) DO NOTHING;
