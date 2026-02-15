-- Facebook leads imported via GroupLead or manual CSV
CREATE TABLE IF NOT EXISTS facebook_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fb_name TEXT,
    email TEXT,
    phone TEXT,
    interests TEXT[],               -- parsed from GroupLead data
    source_group TEXT,               -- FB group name/ID
    import_batch TEXT,               -- batch identifier for tracking imports
    raw_data JSONB,                  -- original GroupLead row for reference
    user_profile_id UUID REFERENCES user_profiles(id),  -- linked canonical profile
    consent_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for dedup and lookups
CREATE INDEX IF NOT EXISTS idx_fb_leads_email ON facebook_leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fb_leads_phone ON facebook_leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fb_leads_batch ON facebook_leads(import_batch);
CREATE INDEX IF NOT EXISTS idx_fb_leads_profile ON facebook_leads(user_profile_id) WHERE user_profile_id IS NOT NULL;

-- RLS
ALTER TABLE facebook_leads ENABLE ROW LEVEL SECURITY;

-- Only service role / authenticated admins can read/write
CREATE POLICY "Service role full access" ON facebook_leads
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);
