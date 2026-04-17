-- ============================================================
-- PORTFOLIO ADMIN — PRODUCTIVITY SCHEMA
-- Run this entire file in the Supabase SQL editor once.
-- ============================================================

-- COMMITMENTS (top-level grouping e.g. Inlaks, SpireCore)
create table if not exists commitments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  color       text not null default '#111111',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- PROJECTS (nested under a commitment e.g. CPay, HIMS)
create table if not exists projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  commitment_id  uuid references commitments(id) on delete cascade not null,
  name           text not null,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

-- TODOS
create table if not exists todos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  commitment_id  uuid references commitments(id) on delete set null,
  project_id     uuid references projects(id) on delete set null,
  title          text not null,
  notes          text,
  scope          text not null default 'day' check (scope in ('day', 'week')),
  due_date       date,
  status         text not null default 'open' check (status in ('open', 'completed', 'archived')),
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- ACHIEVEMENTS
create table if not exists achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  commitment_id  uuid references commitments(id) on delete set null,
  project_id     uuid references projects(id) on delete set null,
  source_todo_id uuid references todos(id) on delete set null,
  title          text not null,
  notes          text,
  date           date not null default current_date,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — users only see their own data
-- ============================================================
alter table commitments  enable row level security;
alter table projects     enable row level security;
alter table todos        enable row level security;
alter table achievements enable row level security;

create policy "own commitments"  on commitments  for all using (auth.uid() = user_id);
create policy "own projects"     on projects     for all using (auth.uid() = user_id);
create policy "own todos"        on todos        for all using (auth.uid() = user_id);
create policy "own achievements" on achievements for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DEFAULT COMMITMENTS + PROJECTS
-- Call this function after your first sign-up via:
--   select seed_defaults('<your-user-uuid>');
-- ============================================================
create or replace function seed_defaults(p_user_id uuid)
returns void language plpgsql as $$
declare
  c_church    uuid;
  c_porchplus uuid;
  c_spirecore uuid;
  c_inlaks    uuid;
  c_other     uuid;
begin
  insert into commitments (user_id, name, color, sort_order) values
    (p_user_id, 'Church Work',    '#7c3aed', 0) returning id into c_church;
  insert into commitments (user_id, name, color, sort_order) values
    (p_user_id, 'Porchplus',      '#0ea5e9', 1) returning id into c_porchplus;
  insert into commitments (user_id, name, color, sort_order) values
    (p_user_id, 'SpireCore',      '#f97316', 2) returning id into c_spirecore;
  insert into commitments (user_id, name, color, sort_order) values
    (p_user_id, 'Inlaks',         '#10b981', 3) returning id into c_inlaks;
  insert into commitments (user_id, name, color, sort_order) values
    (p_user_id, 'Other',          '#6b7280', 4) returning id into c_other;

  -- Inlaks projects
  insert into projects (user_id, commitment_id, name, sort_order) values
    (p_user_id, c_inlaks, 'CPay',           0),
    (p_user_id, c_inlaks, 'HIMS',           1),
    (p_user_id, c_inlaks, 'Account Mapper', 2);

  -- SpireCore projects
  insert into projects (user_id, commitment_id, name, sort_order) values
    (p_user_id, c_spirecore, 'Taxspire', 0);
end;
$$;
