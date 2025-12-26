alter table public.email_logs
add column body text null,
add column user_agent text null,
add column ip_address text null,
add column location text null;
