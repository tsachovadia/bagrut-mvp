-- Add attribution columns to soft_leads for paid campaign tracking
ALTER TABLE soft_leads
ADD COLUMN IF NOT EXISTS landing_page TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;
