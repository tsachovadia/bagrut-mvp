alter table public.user_profiles 
add column if not exists bagrut_grades jsonb default '[]'::jsonb,
add column if not exists saved_simulations jsonb default '[]'::jsonb;

comment on column public.user_profiles.bagrut_grades is 'Raw JSON array of matriculation grades from the calculator';
comment on column public.user_profiles.saved_simulations is 'Raw JSON array of user saved simulations';
