-- Create a table to store user calculation data
create table if not exists user_calculations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  bagrut_data jsonb default '[]'::jsonb,
  psychometric_data jsonb default '{}'::jsonb,
  preferences jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_calculations enable row level security;

-- Create policies
create policy "Users can view their own calculations"
  on user_calculations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own calculations"
  on user_calculations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own calculations"
  on user_calculations for update
  using (auth.uid() = user_id);

-- Optional: Policy for anonymous access if we want to allow saving without login via some guest ID (or just rely on client-side storage for guests)
-- For now, we only secure authenticated access.
