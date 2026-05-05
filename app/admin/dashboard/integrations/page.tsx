import { createClient } from '@/lib/supabase/server';
import IntegrationsClient from './IntegrationsClient';

export const metadata = { title: 'Integrations — Admin' };

interface PageProps {
  searchParams: Promise<{ gconnected?: string; gdisconnected?: string; gerr?: string }>;
}

export default async function IntegrationsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const [{ data: integration }, { data: externalTodos }] = await Promise.all([
    supabase
      .from('user_integrations')
      .select('*')
      .eq('source', 'google_tasks')
      .maybeSingle(),
    supabase
      .from('external_todos')
      .select('*')
      .eq('source', 'google_tasks')
      .is('imported_todo_id', null),
  ]);

  let banner: { kind: 'connected' | 'disconnected' | 'error'; message: string } | null = null;
  if (params.gconnected) banner = { kind: 'connected', message: 'Google Tasks connected.' };
  else if (params.gdisconnected) banner = { kind: 'disconnected', message: 'Google Tasks disconnected.' };
  else if (params.gerr) banner = { kind: 'error', message: `Connection failed: ${params.gerr}` };

  return (
    <IntegrationsClient
      googleIntegration={integration ?? null}
      externalTodoCount={(externalTodos ?? []).length}
      banner={banner}
    />
  );
}
