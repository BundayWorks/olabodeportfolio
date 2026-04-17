import { createClient } from '@/lib/supabase/server';
import ReportsClient from './ReportsClient';

export const metadata = { title: 'Reports — Admin' };

export default async function ReportsPage() {
  const supabase = await createClient();

  const [{ data: todos }, { data: achievements }, { data: commitments }] = await Promise.all([
    supabase.from('todos').select('*, commitments(*), projects(*)').order('created_at', { ascending: false }),
    supabase.from('achievements').select('*, commitments(*), projects(*)').order('date', { ascending: false }),
    supabase.from('commitments').select('*, projects(*)').order('sort_order'),
  ]);

  return (
    <ReportsClient
      todos={todos ?? []}
      achievements={achievements ?? []}
      commitments={commitments ?? []}
    />
  );
}
