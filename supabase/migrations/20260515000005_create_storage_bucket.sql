-- Storage bucket for Disto PDF deliverables (private, signed URLs)
insert into storage.buckets (id, name, public)
values ('disto-deliverables', 'disto-deliverables', false);

-- agency_admin can upload and read
create policy "disto-deliverables: agency_admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'disto-deliverables'
    and public.get_my_role() = 'agency_admin'
  );

create policy "disto-deliverables: agency_admin read"
  on storage.objects for select
  using (
    bucket_id = 'disto-deliverables'
    and public.get_my_role() = 'agency_admin'
  );

create policy "disto-deliverables: agency_admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'disto-deliverables'
    and public.get_my_role() = 'agency_admin'
  );
