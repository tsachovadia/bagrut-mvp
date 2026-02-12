-- Bot link tokens for secure web-to-Telegram account linking
CREATE TABLE IF NOT EXISTS bot_link_tokens (
    token TEXT PRIMARY KEY,
    web_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_bot_link_tokens_expires ON bot_link_tokens(expires_at);
CREATE INDEX idx_bot_link_tokens_web_user ON bot_link_tokens(web_user_id);
