-- Add new columns for enhanced CRM data
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS joined_group_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS target_degree TEXT;
