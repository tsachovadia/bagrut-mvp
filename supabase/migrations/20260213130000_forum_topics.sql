-- Forum Topics support for bot_groups
-- Allows a supergroup with Topics enabled to have child topic rows in bot_groups.
-- Each topic shares the parent's telegram_group_id but has a unique forum_topic_id.

-- Drop old unique constraint on telegram_group_id (topics share parent's group_id)
ALTER TABLE bot_groups DROP CONSTRAINT IF EXISTS bot_groups_telegram_group_id_key;

-- Add forum topic columns
ALTER TABLE bot_groups ADD COLUMN IF NOT EXISTS is_forum BOOLEAN DEFAULT FALSE;
ALTER TABLE bot_groups ADD COLUMN IF NOT EXISTS forum_topic_id INTEGER;
ALTER TABLE bot_groups ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES bot_groups(id) ON DELETE CASCADE;

-- New unique constraint: either a unique group (topic_id NULL → 0) or a unique topic within a group
CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_groups_unique_group_topic
    ON bot_groups (telegram_group_id, COALESCE(forum_topic_id, 0));
