-- Table brand_structure_proposals
-- A client_admin proposes a change to a section; the agency approves or rejects it.
create table public.brand_structure_proposals (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references public.clients (id) on delete cascade,
  section_key       text not null,
  content_before    text not null default '',
  content_proposed  text not null,
  status            text not null default 'pending'
                      check (status in ('pending', 'approved', 'rejected')),
  agency_comment    text,
  proposed_by       uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz
);

alter table public.brand_structure_proposals enable row level security;

-- agency_admin : full access
create policy "proposals: agency_admin all"
  on public.brand_structure_proposals for all
  using (public.get_my_role() = 'agency_admin')
  with check (public.get_my_role() = 'agency_admin');

-- client admin : insert their own proposals (must be admin of THIS brand)
create policy "proposals: client_admin insert"
  on public.brand_structure_proposals for insert
  with check (
    proposed_by = auth.uid()
    and brand_id = (
      select id from public.clients
      where slug = (select brand_slug from public.profiles where id = auth.uid())
    )
    and exists (
      select 1 from public.client_users
      where user_id = auth.uid()
        and client_id = brand_id
        and status = 'active'
        and role = 'admin'
    )
  );

-- client users : read proposals for their own brand
create policy "proposals: client read own"
  on public.brand_structure_proposals for select
  using (
    brand_id = (
      select id from public.clients
      where slug = (select brand_slug from public.profiles where id = auth.uid())
    )
  );
