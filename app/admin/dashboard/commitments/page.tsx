import { createClient } from '@/lib/supabase/server';
import CommitmentsManager from './CommitmentsManager';

export const metadata = { title: 'Commitments — Admin' };

export default async function CommitmentsPage() {
  const supabase = await createClient();
  const { data: commitments } = await supabase
    .from('commitments')
    .select('*, projects(*)')
    .order('sort_order');

  return <CommitmentsManager initialCommitments={commitments ?? []} />;
}
