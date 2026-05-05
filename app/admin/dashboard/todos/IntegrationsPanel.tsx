'use client';
import { useState } from 'react';
import type { ExternalTodo, UserIntegration } from '@/lib/supabase/types';

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function IntegrationsPanel({
  integration,
  todos,
  banner,
}: {
  integration: UserIntegration | null;
  todos: ExternalTodo[];
  banner: { kind: 'connected' | 'disconnected' | 'error'; message: string } | null;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/sync/google-tasks/manual', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setSyncMsg(`Synced ${json.tasks} task${json.tasks === 1 ? '' : 's'}`);
        // Soft refresh so the server component re-fetches
        setTimeout(() => location.reload(), 700);
      } else {
        setSyncMsg(`Sync failed: ${json.error ?? 'unknown'}`);
      }
    } catch (e) {
      setSyncMsg('Sync failed: network error');
    } finally {
      setSyncing(false);
    }
  };

  const accent = '#1a73e8';
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 10, border: '1.5px solid #ebebeb',
    padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
  };

  const open = todos.filter(t => t.status === 'open');
  const completed = todos.filter(t => t.status === 'completed');

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>
            Google Tasks
          </h3>
          {integration ? (
            <p style={{ fontSize: '0.78rem', color: '#666' }}>
              Connected
              {(integration.metadata as { email?: string } | null)?.email
                ? ` as ${(integration.metadata as { email: string }).email}`
                : ''}
              {' · '}Last synced {timeAgo(integration.last_synced_at)}
            </p>
          ) : (
            <p style={{ fontSize: '0.78rem', color: '#666' }}>
              Not connected. Pull todos from your Google account every 15 minutes.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {integration ? (
            <>
              <button
                onClick={handleSync}
                disabled={syncing}
                style={{
                  fontSize: '0.78rem', fontWeight: 600, padding: '0.5rem 0.95rem',
                  border: '1.5px solid #111', background: 'none', borderRadius: 999,
                  cursor: syncing ? 'default' : 'pointer', opacity: syncing ? 0.6 : 1,
                }}
              >
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
              <form action="/api/integrations/google/disconnect" method="post">
                <button
                  type="submit"
                  style={{
                    fontSize: '0.78rem', fontWeight: 500, padding: '0.5rem 0.95rem',
                    border: '1.5px solid #ddd', background: 'none', color: '#666',
                    borderRadius: 999, cursor: 'pointer',
                  }}
                >
                  Disconnect
                </button>
              </form>
            </>
          ) : (
            <a
              href="/api/integrations/google/connect"
              style={{
                fontSize: '0.78rem', fontWeight: 600, padding: '0.55rem 1rem',
                background: accent, color: '#fff', borderRadius: 999, textDecoration: 'none',
              }}
            >
              Connect Google Tasks
            </a>
          )}
        </div>
      </div>

      {banner && (
        <p style={{
          marginTop: '0.75rem', fontSize: '0.78rem',
          color: banner.kind === 'error' ? '#cc0000' : '#0c7a3a',
        }}>
          {banner.message}
        </p>
      )}

      {syncMsg && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#444' }}>{syncMsg}</p>
      )}

      {integration && todos.length > 0 && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>
            {open.length} open · {completed.length} completed
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {open.slice(0, 8).map(t => (
              <li
                key={t.id}
                style={{
                  fontSize: '0.85rem', color: '#222', display: 'flex',
                  alignItems: 'baseline', gap: '0.5rem',
                }}
              >
                <span style={{ color: '#bbb', fontSize: '0.7rem' }}>•</span>
                <span style={{ flex: 1 }}>{t.title}</span>
                {t.list_name && (
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>{t.list_name}</span>
                )}
                {t.due_at && (
                  <span style={{ fontSize: '0.7rem', color: '#0c7a3a' }}>
                    due {new Date(t.due_at).toLocaleDateString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {open.length > 8 && (
            <p style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#888' }}>
              + {open.length - 8} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
