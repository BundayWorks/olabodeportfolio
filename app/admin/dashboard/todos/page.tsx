import { createClient } from '@/lib/supabase/server';
import TodosClient from './TodosClient';
import IntegrationsPanel from './IntegrationsPanel';

export const metadata = { title: 'Todos — Admin' };

interface PageProps {
  searchParams: Promise<{ gconnected?: string; gdisconnected?: string; gerr?: string }>;
}

export default async function TodosPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const [
    { data: todos },
    { data: commitments },
    { data: integration },
    { data: externalTodos },
  ] = await Promise.all([
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
      .from('user_integrations')
      .select('*')
      .eq('source', 'google_tasks')
      .maybeSingle(),
    supabase
      .from('external_todos')
      .select('*')
      .eq('source', 'google_tasks')
      .order('due_at', { ascending: true, nullsFirst: false }),
  ]);

  let banner: { kind: 'connected' | 'disconnected' | 'error'; message: string } | null = null;
  if (params.gconnected) banner = { kind: 'connected', message: 'Google Tasks connected.' };
  else if (params.gdisconnected) banner = { kind: 'disconnected', message: 'Google Tasks disconnected.' };
  else if (params.gerr) banner = { kind: 'error', message: `Connection failed: ${params.gerr}` };

  return (
    <>
      <IntegrationsPanel
        integration={integration ?? null}
        todos={externalTodos ?? []}
        banner={banner}
      />
      <TodosClient initialTodos={todos ?? []} commitments={commitments ?? []} />
    </>
  );
}
