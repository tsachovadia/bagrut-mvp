create table public.email_logs (
  id uuid not null default gen_random_uuid(),
  lead_id uuid null,
  resend_email_id text null,
  status text not null default 'sent'::text,
  subject text null,
  recipient_email text null,
  opened_at timestamp with time zone null,
  clicked_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint email_logs_pkey primary key (id),
  constraint email_logs_lead_id_fkey foreign key (lead_id) references leads (id) on delete set null
);

-- Enable RLS
alter table public.email_logs enable row level security;

-- Create policy to allow authenticated users to view logs
create policy "Enable read access for authenticated users" on public.email_logs
  for select to authenticated using (true);

-- Create policy to allow authenticated users to insert logs
create policy "Enable insert for authenticated users" on public.email_logs
  for insert to authenticated with check (true);

-- Create policy to allow service role (or authenticated) to update logs (for webhooks)
create policy "Enable update for service role" on public.email_logs
  for update using (true);
