-- Migration: Seed Community Clusters
-- Replaces existing bot_groups with the 6 specific study field clusters

DELETE FROM bot_groups;

INSERT INTO bot_groups (telegram_group_id, name, type, invite_link, description, linked_field, is_active, auto_moderate)
VALUES
    -- Tech & Engineering (Placeholder ID: -1001)
    ('-1001', 'הייטק והנדסה - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_TECH', 
     'קהילה למועמדים למדעי המחשב, הנדסה, וסייבר במוסדות המובילים.', 'tech', true, true),

    -- Medicine & Health (Placeholder ID: -1002)
    ('-1002', 'רפואה ובריאות - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_MED', 
     'קהילה למועמדים לרפואה (4/7 שנתי), סיעוד ומקצועות הבריאות.', 'med', true, true),

    -- Law & Government (Placeholder ID: -1003)
    ('-1003', 'משפטים וממשל - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_LAW', 
     'קהילה למועמדים למשפטים, מדעי המדינה ופכ"מ.', 'law', true, true),

    -- Mind & Society (Placeholder ID: -1004)
    ('-1004', 'נפש וחברה - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_MIND', 
     'קהילה למועמדים לפסיכולוגיה, עבודה סוציאלית ומדעי החברה.', 'mind', true, true),

    -- Business & Management (Placeholder ID: -1005)
    ('-1005', 'ניהול ועסקים - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_BIZ', 
     'קהילה למועמדים למנהל עסקים, כלכלה וחשבונאות.', 'business', true, true),

    -- Design & Architecture (Placeholder ID: -1006)
    ('-1006', 'עיצוב ואדריכלות - מתלבטים', 'field', 'https://t.me/+PLACEHOLDER_DESIGN', 
     'קהילה למועמדים לאדריכלות ומקצועות העיצוב.', 'design', true, true);
