-- Add description and field_tags columns to bot_groups
ALTER TABLE bot_groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE bot_groups ADD COLUMN IF NOT EXISTS field_tags TEXT[] DEFAULT '{}';
