-- Fix column reference ambiguity in save/publish/restore SQL functions.
-- PG error 42702: the OUT columns of `returns table(id, version, ...)` collide
-- with the brand_structures table columns in RETURNING / SELECT statements.
-- We rename the OUT parameters with an `out_` prefix to disambiguate.
--
-- Renaming OUT parameters changes the function signature, which CREATE OR REPLACE
-- refuses (SQLSTATE 42P13). So we DROP the previous versions first.

drop function if exists public.save_brand_structure(uuid, jsonb);
drop function if exists public.publish_brand_structure(uuid, jsonb);
drop function if exists public.restore_brand_structure_version(uuid);

create or replace function public.save_brand_structure(
  source_structure_id uuid,
  new_sections jsonb
)
returns table (out_id uuid, out_version integer, out_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  next_version integer;
  next_status text;
begin
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

  update public.brand_structures
     set is_current = false
   where client_id = src.client_id
     and is_current = true;

  return query
    insert into public.brand_structures
      (client_id, version, sections, status, is_current, created_by)
    values
      (src.client_id, next_version, new_sections, next_status, true, auth.uid())
    returning brand_structures.id, brand_structures.version, brand_structures.status;
end;
$$;

revoke all on function public.save_brand_structure(uuid, jsonb) from public;
grant execute on function public.save_brand_structure(uuid, jsonb) to authenticated;


create or replace function public.publish_brand_structure(
  source_structure_id uuid,
  new_sections jsonb
)
returns table (out_id uuid, out_version integer, out_published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  client_status text;
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

  update public.brand_structures
     set status = 'archived'
   where client_id = src.client_id
     and status = 'published'
     and id <> src.id;

  if client_status = 'draft' then
    update public.clients set status = 'active' where id = src.client_id;
  end if;

  return query
    update public.brand_structures
       set sections = new_sections,
           status = 'published',
           published_at = now()
     where brand_structures.id = src.id
    returning brand_structures.id, brand_structures.version, brand_structures.published_at;
end;
$$;

revoke all on function public.publish_brand_structure(uuid, jsonb) from public;
grant execute on function public.publish_brand_structure(uuid, jsonb) to authenticated;


create or replace function public.restore_brand_structure_version(
  source_structure_id uuid
)
returns table (out_id uuid, out_version integer, out_published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  client_status text;
  next_version integer;
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

  update public.brand_structures
     set is_current = false
   where client_id = src.client_id
     and is_current = true;

  update public.brand_structures
     set status = 'archived'
   where client_id = src.client_id
     and status = 'published';

  if client_status = 'draft' then
    update public.clients set status = 'active' where id = src.client_id;
  end if;

  return query
    insert into public.brand_structures
      (client_id, version, sections, status, is_current, created_by,
       restored_from_version, published_at)
    values
      (src.client_id, next_version, src.sections, 'published', true, auth.uid(),
       src.version, now())
    returning brand_structures.id, brand_structures.version, brand_structures.published_at;
end;
$$;

revoke all on function public.restore_brand_structure_version(uuid) from public;
grant execute on function public.restore_brand_structure_version(uuid) to authenticated;
