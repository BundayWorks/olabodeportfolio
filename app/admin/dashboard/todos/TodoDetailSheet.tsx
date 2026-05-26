'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project, TodoWithRelations } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };
type Scope = 'day' | 'week';

interface Props {
  todo: TodoWithRelations;
  commitments: CommitmentWithProjects[];
  onClose: () => void;
  onChanged: () => void;       // saved / status changed / project moved
  onDeleted: () => void;       // row removed
  onArchived: () => void;      // converted to achievement
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function TodoDetailSheet({ todo, commitments, onClose, onChanged, onDeleted, onArchived }: Props) {
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes ?? '');
  const [scope, setScope] = useState<Scope>(todo.scope);
  const [dueDate, setDueDate] = useState(todo.due_date ?? '');
  const [commitmentId, setCommitmentId] = useState(todo.commitment_id ?? '');
  const [projectId, setProjectId] = useState(todo.project_id ?? '');
  const [status, setStatus] = useState(todo.status);

  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<null | 'save' | 'delete' | 'archive' | 'status'>(null);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // ESC closes the modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const selectedCommitment = commitments.find(c => c.id === commitmentId);
  const isCompleted = status === 'completed';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => (createClient() as any);

  const dirty =
    title !== todo.title ||
    notes !== (todo.notes ?? '') ||
    scope !== todo.scope ||
    dueDate !== (todo.due_date ?? '') ||
    commitmentId !== (todo.commitment_id ?? '') ||
    projectId !== (todo.project_id ?? '');

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setError(''); setSaving(true); setBusy('save');
    const { error: err } = await db()
      .from('todos')
      .update({
        title: title.trim(),
        notes: notes.trim() || null,
        scope,
        due_date: dueDate || null,
        commitment_id: commitmentId || null,
        project_id: projectId || null,
      })
      .eq('id', todo.id);
    setSaving(false); setBusy(null);
    if (err) { setError(err.message ?? 'Failed to save'); return; }
    setSavedAt(Date.now());
    onChanged();
  };

  const toggleStatus = async () => {
    setBusy('status');
    const nextStatus = isCompleted ? 'open' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
    const { error: err } = await db()
      .from('todos')
      .update({ status: nextStatus, completed_at: completedAt })
      .eq('id', todo.id);
    setBusy(null);
    if (err) { setError(err.message); return; }
    setStatus(nextStatus);
    onChanged();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this todo? This cannot be undone.')) return;
    setBusy('delete');
    const { error: err } = await db().from('todos').delete().eq('id', todo.id);
    setBusy(null);
    if (err) { setError(err.message); return; }
    onDeleted();
  };

  const handleArchive = async () => {
    setBusy('archive');
    const { data: { user } } = await db().auth.getUser();
    if (!user) { setBusy(null); setError('Not signed in.'); return; }
    const todayIso = new Date().toISOString().slice(0, 10);
    await db().from('achievements').insert({
      user_id: user.id,
      title: title.trim() || todo.title,
      notes: notes || null,
      commitment_id: commitmentId || null,
      project_id: projectId || null,
      source_todo_id: todo.id,
      date: todayIso,
    });
    await db().from('todos').update({ status: 'archived' }).eq('id', todo.id);
    setBusy(null);
    onArchived();
  };

  const label: React.CSSProperties = {
    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--a-text3)',
    display: 'block', marginBottom: '0.35rem',
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div
        className="sheet"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 640, width: '100%', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', padding: 0,
        }}
      >
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.95rem 1.15rem',
          borderBottom: '1px solid var(--a-border)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--a-text3)', marginBottom: '0.25rem' }}>
              Todo · #{todo.id.slice(0, 8)}
            </p>
            <span
              style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                padding: '0.2rem 0.65rem', borderRadius: 999,
                color: isCompleted ? '#0c7a3a' : '#1d4ed8',
                background: isCompleted ? 'rgba(12, 122, 58, 0.10)' : 'rgba(29, 78, 216, 0.10)',
              }}
            >
              {isCompleted ? '✓ Completed' : 'Open'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', fontSize: '1.5rem',
              color: 'var(--a-text2)', cursor: 'pointer', padding: '0 0.3rem',
              lineHeight: 1, flexShrink: 0,
            }}
          >×</button>
        </header>

        {/* Body */}
        <div style={{
          flex: 1, minHeight: 0, overflow: 'auto',
          padding: '1.1rem 1.15rem',
        }}>
          {/* Title */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={label}>Title</label>
            <input
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                fontSize: '1.05rem', fontWeight: 600,
                padding: '0.55rem 0.7rem',
                width: '100%',
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={label}>Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional details…"
              style={{ width: '100%', resize: 'vertical', minHeight: 72 }}
            />
          </div>

          {/* Scope + due date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
            <div>
              <label style={label}>Scope</label>
              <select className="form-input" value={scope} onChange={e => setScope(e.target.value as Scope)} style={{ width: '100%' }}>
                <option value="day">Today</option>
                <option value="week">This week</option>
              </select>
            </div>
            <div>
              <label style={label}>Due date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Commitment + project */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
            <div>
              <label style={label}>Commitment</label>
              <select
                className="form-input"
                value={commitmentId}
                onChange={e => { setCommitmentId(e.target.value); setProjectId(''); }}
                style={{ width: '100%' }}
              >
                <option value="">None</option>
                {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Project</label>
              <select
                className="form-input"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                disabled={!commitmentId}
                style={{ width: '100%' }}
              >
                <option value="">None</option>
                {(selectedCommitment?.projects ?? []).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            padding: '0.7rem 0.85rem', borderRadius: 8,
            background: 'var(--a-surface, rgba(0,0,0,0.03))',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem',
            fontSize: '0.75rem', color: 'var(--a-text2)',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--a-text3)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Created</p>
              <p>{fmtDateTime(todo.created_at)}</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--a-text3)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Completed</p>
              <p>{fmtDateTime(todo.completed_at)}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontWeight: 700, color: 'var(--a-text3)', fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Due (current)</p>
              <p>{fmtDate(dueDate || null)}</p>
            </div>
          </div>

          {error && (
            <p className="form-error" style={{ marginTop: '0.85rem' }}>{error}</p>
          )}
          {savedAt && !dirty && !error && (
            <p style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#0c7a3a', fontWeight: 600 }}>
              ✓ Saved
            </p>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          padding: '0.85rem 1.15rem',
          borderTop: '1px solid var(--a-border)',
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
        }}>
          {/* Primary actions: status + save */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={toggleStatus}
              disabled={busy !== null}
              className="btn btn-secondary"
              style={{ flex: '1 1 140px', fontSize: '0.82rem' }}
            >
              {busy === 'status'
                ? 'Updating…'
                : isCompleted ? '↩ Reopen' : '✓ Mark complete'}
            </button>
            <button
              onClick={handleSave}
              disabled={busy !== null || saving || !dirty}
              className="btn btn-primary"
              style={{ flex: '1 1 140px', fontSize: '0.82rem' }}
            >
              {busy === 'save' ? 'Saving…' : dirty ? 'Save changes' : 'No changes'}
            </button>
          </div>
          {/* Secondary actions: archive + delete */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isCompleted && (
              <button
                onClick={handleArchive}
                disabled={busy !== null}
                className="btn btn-secondary"
                style={{ flex: '1 1 140px', fontSize: '0.78rem' }}
                title="Log as achievement and archive this todo"
              >
                🏆 Convert to achievement
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={busy !== null}
              style={{
                flex: '1 1 100px', fontSize: '0.78rem', fontWeight: 600,
                padding: '0.55rem 0.9rem', borderRadius: 8,
                border: '1px solid rgba(160, 42, 42, 0.4)',
                background: 'transparent', color: '#a02a2a',
                cursor: busy === null ? 'pointer' : 'default',
                opacity: busy === null ? 1 : 0.6,
                fontFamily: 'inherit',
              }}
            >
              {busy === 'delete' ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
