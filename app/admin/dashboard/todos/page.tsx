import { createClient } from '@/lib/supabase/server';
import TodosClient from './TodosClient';

export const metadata = { title: 'Todos — Admin' };

export default async function TodosPage() {
  const supabase = await createClient();

  const [{ data: todos }, { data: commitments }] = await Promise.all([
    supabase
      .from('todos')
      .select('*, commitments(*), projects(*)')
      .neq('status', 'archived')
      .order('created_at', { ascending: false }),
    supabase
      .from('commitments')
      .select('*, projects(*)')
      .order('sort_order'),
  ]);

  return <TodosClient initialTodos={todos ?? []} commitments={commitments ?? []} />;
}
