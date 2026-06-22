-- Fix column reference ambiguity in the "clients: client read own" RLS policy.
--
-- The policy added in 20260606000000_multi_brand_rls.sql intended the unqualified
-- `id` in `where cu.client_id = id` to refer to the outer clients.id row. But
-- inside the subquery, client_users (aliased cu) is in scope and also has an `id`
-- column, so Postgres binds the bare `id` to cu.id. The predicate effectively
-- becomes `cu.client_id = cu.id`, which is never true — so no client user can
-- read their clients row, and login always falls through to the noPortal error.
--
-- Qualify the column as clients.id to bind it to the outer table.

drop policy if exists "clients: client read own" on public.clients;

create policy "clients: client read own"
  on public.clients for select
  using (
    exists (
      select 1
      from public.client_users cu
      where cu.client_id = clients.id
        and cu.user_id   = auth.uid()
        and cu.status    = 'active'
    )
  );
