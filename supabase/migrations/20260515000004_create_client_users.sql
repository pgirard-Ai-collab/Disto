-- Table client_users
-- Links auth.users to a client with a role and status.
-- Populated when agency invites a user via Supabase Auth inviteUserByEmail.
create table public.client_users (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'reader'
                check (role in ('admin', 'reader')),
  status      text not null default 'invited'
                check (status in ('invited', 'active', 'disabled')),
  invited_at  timestamptz not null default now(),
  unique (client_id, user_id)
);

alter table public.client_users enable row level security;

-- agency_admin : full access
create policy "client_users: agency_admin all"
  on public.client_users for all
  using (public.get_my_role() = 'agency_admin')
  with check (public.get_my_role() = 'agency_admin');

-- client users : read their own row
create policy "client_users: self read"
  on public.client_users for select
  using (user_id = auth.uid());

-- RPC for the set-password page to call after the user sets their first password.
-- Flips the caller's client_users row from 'invited' to 'active'.
create or replace function public.activate_my_client_access()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.client_users
  set status = 'active'
  where user_id = auth.uid()
    and status = 'invited';
end;
$$;

grant execute on function public.activate_my_client_access() to authenticated;
