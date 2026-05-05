'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { UserIntegration } from '@/lib/supabase/types';

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

interface Props {
  googleIntegration: UserIntegration | null;
  externalTodoCount: number;
  banner: { kind: 'connected' | 'disconnected' | 'error'; message: string } | null;
}

export default function IntegrationsClient({ googleIntegration, externalTodoCount, banner }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/sync/google-tasks/manual', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setSyncMsg(`Synced ${json.tasks} task${json.tasks === 1 ? '' : 's'}.`);
        setTimeout(() => location.reload(), 700);
      } else {
        const detail = json.detail ? ` — ${String(json.detail).slice(0, 240)}` : '';
        setSyncMsg(`Sync failed: ${json.error ?? 'unknown'}${detail}`);
      }
    } catch {
      setSyncMsg('Sync failed: network error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--a-text)', marginBottom: '0.25rem' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--a-text2)' }}>
          Connect external tools so their items show up alongside your manual todos.
        </p>
      </div>

      {banner && (
        <div
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.85rem',
            border: '1px solid',
            borderColor: banner.kind === 'error' ? '#f5c2c2' : '#bfe3cc',
            background: banner.kind === 'error' ? '#fdf0f0' : '#eef9f1',
            color: banner.kind === 'error' ? '#a02a2a' : '#0c7a3a',
          }}
        >
          {banner.message}
        </div>
      )}

      <div className="admin-card admin-card--padded" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flex: 1, minWidth: 280 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#e8f0fe', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
              }}
            >
              📋
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem', color: 'var(--a-text)' }}>
                Google Tasks
              </h3>
              {googleIntegration ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
                  Connected
                  {(googleIntegration.metadata as { email?: string } | null)?.email
                    ? ` as ${(googleIntegration.metadata as { email: string }).email}`
                    : ''}
                  {' · '}Last synced {timeAgo(googleIntegration.last_synced_at)}
                  {' · '}{externalTodoCount} unimported task{externalTodoCount === 1 ? '' : 's'}
                </p>
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
                  Pull tasks from your Google account into the Synced tab on Todos.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {googleIntegration ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '0.5rem 1rem',
                    border: '1.5px solid var(--a-text)', background: 'none', borderRadius: 999,
                    color: 'var(--a-text)',
                    cursor: syncing ? 'default' : 'pointer', opacity: syncing ? 0.6 : 1,
                  }}
                >
                  {syncing ? 'Syncing…' : 'Sync now'}
                </button>
                <Link
                  href="/admin/dashboard/todos?tab=synced"
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '0.5rem 1rem',
                    border: '1.5px solid var(--a-blue)', borderRadius: 999,
                    color: 'var(--a-blue)', textDecoration: 'none',
                  }}
                >
                  View synced
                </Link>
                <form action="/api/integrations/google/disconnect" method="post">
                  <button
                    type="submit"
                    style={{
                      fontSize: '0.78rem', fontWeight: 500, padding: '0.5rem 1rem',
                      border: '1.5px solid var(--a-border)', background: 'none', color: 'var(--a-text2)',
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
                  fontSize: '0.78rem', fontWeight: 600, padding: '0.55rem 1.1rem',
                  background: '#1a73e8', color: '#fff', borderRadius: 999, textDecoration: 'none',
                }}
              >
                Connect Google Tasks
              </a>
            )}
          </div>
        </div>

        {syncMsg && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--a-text2)' }}>{syncMsg}</p>
        )}
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--a-text3)', marginTop: '1.5rem' }}>
        More integrations coming soon — Todoist, Microsoft To Do, Linear, Notion.
      </p>
    </div>
  );
}
