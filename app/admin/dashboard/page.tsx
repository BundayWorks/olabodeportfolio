import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Overview — Admin' };

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: openCount },
    { count: doneCount },
    { count: achieveCount },
    { data: recentTodos },
    { data: recentAchievements },
  ] = await Promise.all([
    supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('todos').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
    supabase.from('todos').select('*, commitments(name, color)').eq('status', 'open')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('achievements').select('*, commitments(name, color)')
      .order('date', { ascending: false }).limit(4),
  ]);

  const displayName = user?.email?.split('@')[0] ?? 'there';
  const total = (openCount ?? 0) + (doneCount ?? 0);
  const completionRate = total > 0 ? Math.round(((doneCount ?? 0) / total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-3)', fontWeight: 500, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '0.25rem' }}>
          {greeting}, {displayName}.
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--admin-text-2)' }}>
          {openCount === 0
            ? 'All caught up — nothing open. Great work!'
            : `You have ${openCount} open todo${openCount !== 1 ? 's' : ''} today.`}
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { label: 'Open', value: openCount ?? 0, color: 'var(--admin-blue)', bg: 'var(--admin-blue-soft)' },
          { label: 'Done', value: doneCount ?? 0, color: 'var(--admin-green)', bg: 'var(--admin-green-soft)' },
          { label: 'Achievements', value: achieveCount ?? 0, color: 'var(--admin-amber)', bg: 'var(--admin-amber-soft)' },
        ].map(s => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat__value" style={{ color: s.color }}>{s.value}</div>
            <div className="admin-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      {total > 0 && (
        <div className="admin-card admin-card--padded" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)' }}>Completion rate</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-green)' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${completionRate}%`, background: 'var(--admin-green)' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-3)', marginTop: '0.5rem' }}>
            {doneCount} of {total} todos completed
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Open todos */}
        <div className="admin-card" style={{ gridColumn: recentAchievements?.length === 0 ? '1/-1' : undefined }}>
          <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Open todos</span>
            <Link href="/admin/dashboard/todos" style={{ fontSize: '0.75rem', color: 'var(--admin-blue)', textDecoration: 'none', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {(recentTodos ?? []).length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                <div className="empty-state__icon">✅</div>
                <div className="empty-state__text">All clear!</div>
              </div>
            ) : (
              (recentTodos ?? []).map((t: any) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid #fafafa' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.commitments?.color ?? '#ddd', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    {t.commitments && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-3)' }}>{t.commitments.name}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent achievements */}
        <div className="admin-card">
          <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recent wins</span>
            <Link href="/admin/dashboard/achievements" style={{ fontSize: '0.75rem', color: 'var(--admin-blue)', textDecoration: 'none', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {(recentAchievements ?? []).length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                <div className="empty-state__icon">🏆</div>
                <div className="empty-state__text">No wins yet — log one!</div>
              </div>
            ) : (
              (recentAchievements ?? []).map((a: any) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid #fafafa' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🏆</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-3)' }}>{a.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { href: '/admin/dashboard/todos', label: '+ New todo', icon: '✅' },
          { href: '/admin/dashboard/achievements', label: '+ Log win', icon: '🏆' },
          { href: '/admin/dashboard/reports', label: 'View reports', icon: '📊' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.82rem', color: 'var(--admin-text)', textDecoration: 'none',
            border: '1.5px solid var(--admin-border)', borderRadius: '8px',
            padding: '0.5rem 1rem', fontWeight: 600, background: 'var(--admin-surface)',
            transition: 'all 150ms ease',
          }}>
            {l.icon} {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
