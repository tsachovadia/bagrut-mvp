-- Seed 3 starter Telegram rooms
-- IMPORTANT: Replace 'TBD' values with real Telegram group IDs and invite links
-- after creating the groups manually and adding @MitlabtimBot as admin

INSERT INTO bot_groups (telegram_group_id, name, type, invite_link, description, field_tags, is_active, auto_moderate)
VALUES
    ('TBD', 'מתלבטים - הקהילה', 'general', 'TBD', 'קבוצה כללית לשאלות ודיונים', '{}', true, true),
    ('TBD', 'CS והנדסה - מתלבטים', 'field', 'TBD', 'לכל מי שמעוניין בהנדסה ומדעי המחשב', '{computer_science,engineering}', true, true),
    ('TBD', 'נרשמים 2026 - מתלבטים', 'stage', 'TBD', 'למתכננים להתחיל לימודים ב-2026', '{}', true, true);
