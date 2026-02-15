-- Create soft_leads table for capturing partial leads from homepage modal
CREATE TABLE IF NOT EXISTS soft_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT DEFAULT 'landing_modal',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE soft_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (anon)
CREATE POLICY "Allow anon insert soft_leads" ON soft_leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow reading only by admins (service role) or own user
CREATE POLICY "Allow users to view own soft leads" ON soft_leads
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
