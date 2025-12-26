-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    category TEXT, -- e.g., 'academic', 'influencer', 'ad-agency'
    status TEXT DEFAULT 'potential', -- potential, contacted, active, inactive
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create partner outreach logs table
CREATE TABLE IF NOT EXISTS public.partner_outreach_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    method TEXT NOT NULL, -- whatsapp, email, call, face-to-face
    content TEXT,
    status TEXT DEFAULT 'sent', -- sent, replied, ignored
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_outreach_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (consistent with existing tables in this project)
CREATE POLICY "Allow public access to partners" ON public.partners
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to partner_outreach_logs" ON public.partner_outreach_logs
    FOR ALL USING (true) WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
