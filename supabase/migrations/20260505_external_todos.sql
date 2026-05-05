-- ============================================================================
-- External integrations: stores OAuth refresh tokens per user/source
-- ============================================================================
create table if not exists public.user_integrations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source          text not null,                       -- 'google_tasks', 'todoist', etc.
  refresh_token   text not null,
  access_token    text,
  expires_at      timestamptz,
  scope           text,
  metadata        jsonb default '{}'::jsonb,           -- e.g. google account email
  connected_at    timestamptz not null default now(),
  last_synced_at  timestamptz,
  unique (user_id, source)
);

alter table public.user_integrations enable row level security;

-- Owner can see / manage their own integrations
create policy "user_integrations_owner_select" on public.user_integrations
  for select using (auth.uid() = user_id);
create policy "user_integrations_owner_insert" on public.user_integrations
  for insert with check (auth.uid() = user_id);
create policy "user_integrations_owner_update" on public.user_integrations
  for update using (auth.uid() = user_id);
create policy "user_integrations_owner_delete" on public.user_integrations
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- External todos: items pulled from connected sources
-- (Separate table from public.todos so the existing manual todo system is
--  unaffected.)
-- ============================================================================
create table if not exists public.external_todos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  source        text not null,                         -- 'google_tasks'
  external_id   text not null,                         -- Google's task id
  list_id       text,                                  -- Google task list id
  list_name     text,                                  -- Google task list title
  title         text not null,
  notes         text,
  due_at        timestamptz,
  completed_at  timestamptz,
  status        text not null default 'open',          -- 'open' | 'completed'
  raw           jsonb,
  synced_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists external_todos_user_status_idx
  on public.external_todos (user_id, status, due_at);

alter table public.external_todos enable row level security;

create policy "external_todos_owner_select" on public.external_todos
  for select using (auth.uid() = user_id);
create policy "external_todos_owner_insert" on public.external_todos
  for insert with check (auth.uid() = user_id);
create policy "external_todos_owner_update" on public.external_todos
  for update using (auth.uid() = user_id);
create policy "external_todos_owner_delete" on public.external_todos
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at on row changes
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists external_todos_touch_updated_at on public.external_todos;
create trigger external_todos_touch_updated_at
  before update on public.external_todos
  for each row execute function public.touch_updated_at();
