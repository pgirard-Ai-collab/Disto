-- Brand structure versioning + rollback
--
-- Adds columns and SQL functions that turn every "save" into a new row,
-- support restoring a previous version, and keep an audit trail in-row.
--
-- Invariants enforced from this point onwards:
--   * Exactly one row per client has is_current = true (the editor's working version)
--   * At most one row per client has status = 'published' (the version visible to clients)
--   * The 10 most recent versions are kept; the current and published rows are never purged.

-- ── 1. Schema changes ───────────────────────────────────────────────────────

alter table public.brand_structures
  add column created_by uuid references auth.users (id) on delete set null,
  add column restored_from_version integer,
  add column is_current boolean not null default false;

-- Allow the new 'archived' status (previous published rows transition to it on publish/restore)
alter table public.brand_structures
  drop constraint if exists brand_structures_status_check;

alter table public.brand_structures
  add constraint brand_structures_status_check
    check (status in ('draft', 'published', 'modified', 'archived'));

-- ── 2. Backfill: mark the latest version of each existing client as is_current ──

update public.brand_structures bs
   set is_current = true
  from (
    select distinct on (client_id) id
      from public.brand_structures
     order by client_id, version desc
  ) latest
 where bs.id = latest.id;

-- Enforce "at most one is_current per client" going forward
create unique index brand_structures_one_current_per_client
  on public.brand_structures (client_id)
  where is_current;

-- Enforce "at most one published per client"
create unique index brand_structures_one_published_per_client
  on public.brand_structures (client_id)
  where status = 'published';

-- ── 3. Updated purge: keep 10 most recent, never delete current or published ──

create or replace function public.enforce_brand_structure_version_limit()
returns trigger language plpgsql as $$
begin
  delete from public.brand_structures
   where client_id = new.client_id
     and is_current = false
     and status <> 'published'
     and id not in (
       select id from public.brand_structures
        where client_id = new.client_id
        order by
          is_current desc,
          (status = 'published') desc,
          version desc
        limit 10
     );
  return null;
end;
$$;

-- ── 4. Atomic save: insert a new version and switch is_current ──────────────
--
-- Called from saveBrandStructure (server action). The source_structure_id
-- identifies the row currently visible in the editor; the new row inherits
-- the right status from it (published → modified, otherwise draft).

create or replace function public.save_brand_structure(
  source_structure_id uuid,
  new_sections jsonb
)
returns table (id uuid, version integer, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  next_version integer;
  next_status text;
  new_row record;
begin
  -- AuthZ: only agency_admin can call this
  if public.get_my_role() <> 'agency_admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select bs.id, bs.client_id, bs.status, bs.version
    into src
    from public.brand_structures bs
   where bs.id = source_structure_id
   for update;

  if not found then
    raise exception 'structure_not_found' using errcode = 'P0002';
  end if;

  select coalesce(max(bs.version), 0) + 1
    into next_version
    from public.brand_structures bs
   where bs.client_id = src.client_id;

  next_status := case when src.status = 'published' then 'modified' else 'draft' end;

  -- Flip the previous current off, then insert the new current row
  update public.brand_structures
     set is_current = false
   where client_id = src.client_id
     and is_current = true;

  insert into public.brand_structures
    (client_id, version, sections, status, is_current, created_by)
  values
    (src.client_id, next_version, new_sections, next_status, true, auth.uid())
  returning brand_structures.id, brand_structures.version, brand_structures.status
    into new_row;

  return query select new_row.id, new_row.version, new_row.status;
end;
$$;

revoke all on function public.save_brand_structure(uuid, jsonb) from public;
grant execute on function public.save_brand_structure(uuid, jsonb) to authenticated;

-- ── 5. Atomic publish: promote is_current to published, archive the old one ──

create or replace function public.publish_brand_structure(
  source_structure_id uuid,
  new_sections jsonb
)
returns table (id uuid, version integer, published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  client_status text;
  published record;
begin
  if public.get_my_role() <> 'agency_admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select bs.id, bs.client_id
    into src
    from public.brand_structures bs
   where bs.id = source_structure_id
   for update;

  if not found then
    raise exception 'structure_not_found' using errcode = 'P0002';
  end if;

  select c.status
    into client_status
    from public.clients c
   where c.id = src.client_id;

  if not found then
    raise exception 'client_not_found' using errcode = 'P0002';
  end if;

  if client_status = 'archived' then
    raise exception 'client_archived' using errcode = 'P0001';
  end if;

  -- Demote the previous published row for this client (if any)
  update public.brand_structures
     set status = 'archived'
   where client_id = src.client_id
     and status = 'published'
     and id <> src.id;

  update public.brand_structures
     set sections = new_sections,
         status = 'published',
         published_at = now()
   where id = src.id
  returning brand_structures.id, brand_structures.version, brand_structures.published_at
    into published;

  -- Auto-activate the client on its first publication
  if client_status = 'draft' then
    update public.clients set status = 'active' where id = src.client_id;
  end if;

  return query select published.id, published.version, published.published_at;
end;
$$;

revoke all on function public.publish_brand_structure(uuid, jsonb) from public;
grant execute on function public.publish_brand_structure(uuid, jsonb) to authenticated;

-- ── 6. Atomic restore: copy an old version forward as the new published one ──
--
-- Creates a brand-new row (preserves history) with is_current=true and
-- status='published'. Demotes the previous published row to 'archived' and
-- the previous current row to is_current=false.

create or replace function public.restore_brand_structure_version(
  source_structure_id uuid
)
returns table (id uuid, version integer, published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  client_status text;
  next_version integer;
  new_row record;
begin
  if public.get_my_role() <> 'agency_admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select bs.id, bs.client_id, bs.sections, bs.version, bs.is_current
    into src
    from public.brand_structures bs
   where bs.id = source_structure_id
   for update;

  if not found then
    raise exception 'structure_not_found' using errcode = 'P0002';
  end if;

  if src.is_current then
    raise exception 'already_current' using errcode = 'P0001';
  end if;

  select c.status
    into client_status
    from public.clients c
   where c.id = src.client_id;

  if not found then
    raise exception 'client_not_found' using errcode = 'P0002';
  end if;

  if client_status = 'archived' then
    raise exception 'client_archived' using errcode = 'P0001';
  end if;

  select coalesce(max(bs.version), 0) + 1
    into next_version
    from public.brand_structures bs
   where bs.client_id = src.client_id;

  -- Demote previous current and previous published
  update public.brand_structures
     set is_current = false
   where client_id = src.client_id
     and is_current = true;

  update public.brand_structures
     set status = 'archived'
   where client_id = src.client_id
     and status = 'published';

  insert into public.brand_structures
    (client_id, version, sections, status, is_current, created_by,
     restored_from_version, published_at)
  values
    (src.client_id, next_version, src.sections, 'published', true, auth.uid(),
     src.version, now())
  returning brand_structures.id, brand_structures.version, brand_structures.published_at
    into new_row;

  if client_status = 'draft' then
    update public.clients set status = 'active' where id = src.client_id;
  end if;

  return query select new_row.id, new_row.version, new_row.published_at;
end;
$$;

revoke all on function public.restore_brand_structure_version(uuid) from public;
grant execute on function public.restore_brand_structure_version(uuid) to authenticated;
