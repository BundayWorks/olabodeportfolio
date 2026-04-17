import { createClient } from '@/lib/supabase/server';
import AchievementsClient from './AchievementsClient';

export const metadata = { title: 'Achievements — Admin' };

export default async function AchievementsPage() {
  const supabase = await createClient();

  const [{ data: achievements }, { data: commitments }] = await Promise.all([
    supabase
      .from('achievements')
      .select('*, commitments(*), projects(*)')
      .order('date', { ascending: false }),
    supabase
      .from('commitments')
      .select('*, projects(*)')
      .order('sort_order'),
  ]);

  return <AchievementsClient initialAchievements={achievements ?? []} commitments={commitments ?? []} />;
}
