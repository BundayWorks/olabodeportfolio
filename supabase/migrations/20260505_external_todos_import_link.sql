-- Link an external_todo to the manual todo it was imported into.
-- Once set, the sync routine will skip the external_todo so it doesn't
-- reappear in the Synced tab.
alter table public.external_todos
  add column if not exists imported_todo_id uuid
    references public.todos(id) on delete set null;

create index if not exists external_todos_imported_idx
  on public.external_todos (user_id, source, imported_todo_id);
