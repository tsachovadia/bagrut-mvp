-- Add consent tracking fields to bot_users table
ALTER TABLE bot_users 
ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;
