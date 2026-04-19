'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => (createClient() as any);

const COLORS = [
  '#6366f1', '#3b82f6', '#22c55e', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#06b6d4',
];

interface Props {
  initialCommitments: CommitmentWithProjects[];
}

export default function CommitmentsManager({ initialCommitments }: Props) {
  const [commitments, setCommitments] = useState(initialCommitments);
  const [isPending, startTransition] = useTransition();
  const [newCommitment, setNewCommitment] = useState({ name: '', color: COLORS[0] });
  const [newProject, setNewProject] = useState<{ [cid: string]: string }>({});
  const [showSheet, setShowSheet] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    const { data } = await db().from('commitments').select('*, projects(*)').order('sort_order');
    setCommitments(data ?? []);
  };

  const addCommitment = async () => {
    if (!newCommitment.name.trim()) return;
    setError('');
    const { data: { user } } = await db().auth.getUser();
    if (!user) return;
    const maxOrder = commitments.reduce((m: number, c: CommitmentWithProjects) => Math.max(m, c.sort_order), 0);
    const { error: err } = await db().from('commitments').insert({
      user_id: user.id,
      name: newCommitment.name.trim(),
      color: newCommitment.color,
      sort_order: maxOrder + 1,
    });
    if (err) { setError(err.message); return; }
    setNewCommitment({ name: '', color: COLORS[0] });
    setShowSheet(false);
    startTransition(refresh);
  };

  const deleteCommitment = async (id: string) => {
    if (!confirm('Delete this commitment and all its projects?')) return;
    await db().from('commitments').delete().eq('id', id);
    startTransition(refresh);
  };

  const addProject = async (commitmentId: string) => {
    const name = (newProject[commitmentId] ?? '').trim();
    if (!name) return;
    const { data: { user } } = await db().auth.getUser();
    if (!user) return;
    const commitment = commitments.find((c: CommitmentWithProjects) => c.id === commitmentId);
    const maxOrder = (commitment?.projects ?? []).reduce((m: number, p: Project) => Math.max(m, p.sort_order), 0);
    await db().from('projects').insert({
      user_id: user.id,
      commitment_id: commitmentId,
      name,
      sort_order: maxOrder + 1,
    });
    setNewProject(prev => ({ ...prev, [commitmentId]: '' }));
    startTransition(refresh);
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await db().from('projects').delete().eq('id', id);
    startTransition(refresh);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Commitments</h1>
          <p>Manage your commitment areas and nested projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSheet(true)}>
          + Add commitment
        </button>
      </div>

      {commitments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🗂️</div>
          <div className="empty-state__text">No commitments yet.</div>
          <div className="empty-state__sub">Add your first commitment area above.</div>
        </div>
      ) : (
        commitments.map((commitment: CommitmentWithProjects) => (
          <div key={commitment.id} className="commitment-card">
            <div className="commitment-card__header">
              <div className="commitment-card__title">
                <span className="commitment-card__dot" style={{ background: commitment.color }} />
                <span className="commitment-card__name">{commitment.name}</span>
                <span className="commitment-card__count">{commitment.projects.length} project{commitment.projects.length !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={() => deleteCommitment(commitment.id)} className="btn-icon" style={{ color: 'var(--a-red)', fontSize: '0.8rem' }}>
                Remove
              </button>
            </div>

            <div className="commitment-card__body">
              {commitment.projects.map((project: Project) => (
                <div key={project.id} className="project-row">
                  <span className="project-row__name">{project.name}</span>
                  <button onClick={() => deleteProject(project.id)} className="btn-icon" style={{ fontSize: '0.75rem' }}>✕</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  value={newProject[commitment.id] ?? ''}
                  onChange={e => setNewProject(p => ({ ...p, [commitment.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addProject(commitment.id)}
                  placeholder="Add project…"
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.82rem' }}
                />
                <button onClick={() => addProject(commitment.id)} disabled={isPending} className="btn btn-secondary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* FAB */}
      <button className="btn-fab" onClick={() => setShowSheet(true)} aria-label="Add commitment">+</button>

      {/* Sheet */}
      {showSheet && (
        <div className="sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet__handle" />
            <div className="sheet__title">New commitment</div>

            <div className="form-field" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={newCommitment.name}
                onChange={e => setNewCommitment(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCommitment()}
                placeholder="e.g. Church Work"
                autoFocus
              />
            </div>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Colour</label>
              <div className="color-swatches">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewCommitment(p => ({ ...p, color: c }))}
                    className={`color-swatch${newCommitment.color === c ? ' selected' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: 'var(--a-bg)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: newCommitment.color, display: 'inline-block' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: newCommitment.name ? 'var(--a-text)' : 'var(--a-text3)' }}>
                {newCommitment.name || 'Preview…'}
              </span>
            </div>

            {error && <p className="form-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn btn-primary" onClick={addCommitment} disabled={isPending} style={{ flex: 1 }}>
                {isPending ? 'Saving…' : 'Add commitment'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowSheet(false); setNewCommitment({ name: '', color: COLORS[0] }); setError(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
