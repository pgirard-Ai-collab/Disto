-- Table brand_structures
-- One row per version per client. The active published version has published_at IS NOT NULL.
create table public.brand_structures (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  version       integer not null default 1,
  sections      jsonb not null default '{}'::jsonb,
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'modified')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (client_id, version)
);

create trigger brand_structures_updated_at
  before update on public.brand_structures
  for each row execute function public.set_updated_at();

-- Keep only the 3 most recent versions per client
create or replace function public.enforce_brand_structure_version_limit()
returns trigger language plpgsql as $$
begin
  delete from public.brand_structures
  where client_id = new.client_id
    and id not in (
      select id from public.brand_structures
      where client_id = new.client_id
      order by version desc
      limit 3
    );
  return null;
end;
$$;

create trigger brand_structures_version_limit
  after insert on public.brand_structures
  for each row execute function public.enforce_brand_structure_version_limit();

alter table public.brand_structures enable row level security;

-- agency_admin : full access
create policy "brand_structures: agency_admin all"
  on public.brand_structures for all
  using (public.get_my_role() = 'agency_admin')
  with check (public.get_my_role() = 'agency_admin');

-- client users : read only published version of their own brand
create policy "brand_structures: client read published"
  on public.brand_structures for select
  using (
    status = 'published'
    and client_id = (
      select id from public.clients
      where slug = (select brand_slug from public.profiles where id = auth.uid())
    )
  );
