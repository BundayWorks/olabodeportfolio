import { createClient } from '@/lib/supabase/server';
import TodosClient from './TodosClient';

export const metadata = { title: 'Todos — Admin' };

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TodosPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const initialTab = params.tab === 'synced' ? 'synced' : 'mine';

  const [{ data: todos }, { data: commitments }, { data: externalTodos }] = await Promise.all([
    supabase
      .from('todos')
      .select('*, commitments(*), projects(*)')
      .neq('status', 'archived')
      .order('created_at', { ascending: false }),
    supabase
      .from('commitments')
      .select('*, projects(*)')
      .order('sort_order'),
    supabase
      .from('external_todos')
      .select('*')
      .is('imported_todo_id', null)
      .order('due_at', { ascending: true, nullsFirst: false }),
  ]);

  return (
    <TodosClient
      initialTodos={todos ?? []}
      commitments={commitments ?? []}
      externalTodos={externalTodos ?? []}
      initialTab={initialTab}
    />
  );
}
