'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Commitment, ExternalTodo, Project } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };
type Scope = 'day' | 'week';

interface Props {
  externalTodos: ExternalTodo[];
  commitments: CommitmentWithProjects[];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isFuture(iso: string | null): boolean {
  if (!iso) return false;
  // Compare on date alone, not time, so "due today" still counts as not past.
  return iso.slice(0, 10) >= todayIso();
}

export default function SyncedTab({ externalTodos, commitments }: Props) {
  const router = useRouter();
  const [showFutureOnly, setShowFutureOnly] = useState(true);
  const [importing, setImporting] = useState<ExternalTodo | null>(null);

  const visible = useMemo(() => {
    if (!showFutureOnly) return externalTodos;
    return externalTodos.filter(t => t.due_at && isFuture(t.due_at));
  }, [externalTodos, showFutureOnly]);

  const hiddenCount = externalTodos.length - visible.length;

  if (externalTodos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔌</div>
        <div className="empty-state__text">No synced tasks yet.</div>
        <div className="empty-state__sub">
          Connect a source on the{' '}
          <a href="/admin/dashboard/integrations" style={{ color: 'var(--a-blue)', textDecoration: 'underline' }}>
            Integrations
          </a>
          {' '}page.
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.7rem', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '0.85rem',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--a-text2)' }}>
          {visible.length} task{visible.length === 1 ? '' : 's'}
          {hiddenCount > 0 && ` · ${hiddenCount} hidden by filter`}
        </p>
        <label style={{ fontSize: '0.78rem', color: 'var(--a-text2)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showFutureOnly}
            onChange={e => setShowFutureOnly(e.target.checked)}
            style={{ accentColor: 'var(--a-blue)' }}
          />
          Hide past-due and undated
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🎯</div>
          <div className="empty-state__text">Nothing scheduled in the future.</div>
          <div className="empty-state__sub">Untick the filter above to see all synced tasks.</div>
        </div>
      ) : (
        visible.map(t => (
          <div key={t.id} className="todo-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="todo-title">{t.title}</div>
              <div className="todo-meta">
                {t.list_name && <span className="chip chip-gray">{t.list_name}</span>}
                {t.due_at && (
                  <span className="chip chip-blue">
                    Due {new Date(t.due_at).toLocaleDateString()}
                  </span>
                )}
                {!t.due_at && <span className="chip chip-gray">No due date</span>}
                {t.status === 'completed' && <span className="chip chip-purple">Completed in source</span>}
              </div>
              {t.notes && (
                <p style={{ fontSize: '0.78rem', color: 'var(--a-text3)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                  {t.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => setImporting(t)}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', flexShrink: 0 }}
            >
              Import
            </button>
          </div>
        ))
      )}

      {importing && (
        <ImportModal
          source={importing}
          commitments={commitments}
          onClose={() => setImporting(null)}
          onImported={() => {
            setImporting(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function ImportModal({
  source,
  commitments,
  onClose,
  onImported,
}: {
  source: ExternalTodo;
  commitments: CommitmentWithProjects[];
  onClose: () => void;
  onImported: () => void;
}) {
  const defaultDue = source.due_at ? source.due_at.slice(0, 10) : todayIso();
  const [title, setTitle] = useState(source.title);
  const [notes, setNotes] = useState(source.notes ?? '');
  const [scope, setScope] = useState<Scope>('day');
  const [dueDate, setDueDate] = useState(defaultDue);
  const [commitmentId, setCommitmentId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedCommitment = commitments.find(c => c.id === commitmentId);

  const handleImport = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/external-todos/${source.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          notes: notes || null,
          scope,
          due_date: dueDate || null,
          commitment_id: commitmentId || null,
          project_id: projectId || null,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Import failed');
        setSubmitting(false);
        return;
      }
      onImported();
    } catch {
      setError('Network error');
      setSubmitting(false);
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__title">Import to my todos</div>

        <div className="form-grid">
          <div className="form-field full">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field full">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Scope</label>
            <select className="form-input" value={scope} onChange={e => setScope(e.target.value as Scope)}>
              <option value="day">Today</option>
              <option value="week">This week</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Due date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Commitment</label>
            <select
              className="form-input"
              value={commitmentId}
              onChange={e => { setCommitmentId(e.target.value); setProjectId(''); }}
            >
              <option value="">None</option>
              {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Project</label>
            <select
              className="form-input"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              disabled={!commitmentId}
            >
              <option value="">None</option>
              {(selectedCommitment?.projects ?? []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting ? 'Importing…' : 'Import to my todos'}
          </button>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
