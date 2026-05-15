-- Table clients
create table public.clients (
  id           uuid primary key default gen_random_uuid(),
  org_name     text not null,
  brand_name   text not null,
  slug         text not null unique,
  logo_url     text,
  status       text not null default 'draft'
                 check (status in ('draft', 'active', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

-- agency_admin : full access
create policy "clients: agency_admin all"
  on public.clients for all
  using (public.get_my_role() = 'agency_admin')
  with check (public.get_my_role() = 'agency_admin');

-- client users : read their own client row (matched by brand_slug on profiles)
create policy "clients: client read own"
  on public.clients for select
  using (
    slug = (select brand_slug from public.profiles where id = auth.uid())
  );
