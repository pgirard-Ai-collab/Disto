-- Replace the clients RLS policy that matched by profiles.brand_slug (single-brand)
-- with one that checks for an active client_users row (supports multi-brand).

drop policy if exists "clients: client read own" on public.clients;

create policy "clients: client read own"
  on public.clients for select
  using (
    exists (
      select 1
      from public.client_users cu
      where cu.client_id = id
        and cu.user_id   = auth.uid()
        and cu.status    = 'active'
    )
  );
