-- Table ingestion_jobs
-- Tracks the pipeline state for each PDF import.
create table public.ingestion_jobs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  pdf_path    text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'running', 'done', 'error')),
  steps       jsonb not null default '[]'::jsonb,
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger ingestion_jobs_updated_at
  before update on public.ingestion_jobs
  for each row execute function public.set_updated_at();

alter table public.ingestion_jobs enable row level security;

-- Required for Supabase Realtime to broadcast full row on UPDATE
alter table public.ingestion_jobs replica identity full;

-- Register table with Supabase Realtime
alter publication supabase_realtime add table public.ingestion_jobs;

-- agency_admin : full access
create policy "ingestion_jobs: agency_admin all"
  on public.ingestion_jobs for all
  using (public.get_my_role() = 'agency_admin')
  with check (public.get_my_role() = 'agency_admin');
