create type public.user_role as enum ('agency_admin', 'client_admin', 'client_reader');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null,
  brand_slug text,
  created_at timestamptz not null default now(),
  constraint brand_slug_required_for_clients
    check (role = 'agency_admin' or brand_slug is not null)
);

alter table public.profiles enable row level security;

-- Helper function that reads role without triggering RLS (avoids infinite recursion)
create or replace function public.get_my_role()
returns public.user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Each user can read their own profile
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

-- agency_admin can read all profiles — uses security definer fn to avoid recursion
create policy "profiles: agency_admin read all"
  on public.profiles for select
  using (public.get_my_role() = 'agency_admin');

-- Only service role can insert/update (via server actions)
-- No insert/update policies needed for anon/authenticated roles
