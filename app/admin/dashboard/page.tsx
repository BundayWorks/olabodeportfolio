import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Overview — Admin' };

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: todoCount }, { count: doneCount }, { count: achieveCount }] = await Promise.all([
    supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
  ]);

  const displayName = user?.email?.split('@')[0] ?? 'there';

  const cards = [
    { label: 'Open todos', value: todoCount ?? 0, color: '#3b82f6' },
    { label: 'Completed todos', value: doneCount ?? 0, color: '#22c55e' },
    { label: 'Achievements logged', value: achieveCount ?? 0, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '860px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.4rem' }}>
        Welcome back, {displayName}.
      </h1>
      <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '2rem' }}>
        Here&apos;s a snapshot of your productivity.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', border: '1.5px solid #ebebeb' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: c.color, marginBottom: '0.25rem' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#666' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', border: '1.5px solid #ebebeb' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick links</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/dashboard/todos', label: '+ New todo' },
            { href: '/admin/dashboard/achievements', label: '+ Log achievement' },
            { href: '/admin/dashboard/commitments', label: 'Manage commitments' },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: '0.82rem', color: '#111', textDecoration: 'none',
              border: '1.5px solid #ddd', borderRadius: '6px', padding: '0.4rem 0.85rem',
              fontWeight: 500,
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
