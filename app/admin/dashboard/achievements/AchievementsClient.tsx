'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project, AchievementWithRelations } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };

interface Props {
  initialAchievements: AchievementWithRelations[];
  commitments: CommitmentWithProjects[];
}

const emptyForm = {
  title: '', notes: '', date: new Date().toISOString().split('T')[0],
  commitment_id: '', project_id: '',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => (createClient() as any);

export default function AchievementsClient({ initialAchievements, commitments }: Props) {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [form, setForm] = useState(emptyForm);
  const [showSheet, setShowSheet] = useState(false);
  const [filterCommitment, setFilterCommitment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const refresh = async () => {
    const { data } = await db()
      .from('achievements').select('*, commitments(*), projects(*)')
      .order('date', { ascending: false });
    setAchievements(data ?? []);
  };

  const addAchievement = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.date) { setError('Date is required.'); return; }
    setError('');
    const { data: { user } } = await db().auth.getUser();
    if (!user) return;
    const { error: err } = await db().from('achievements').insert({
      user_id: user.id,
      title: form.title.trim(),
      notes: form.notes || null,
      date: form.date,
      commitment_id: form.commitment_id || null,
      project_id: form.project_id || null,
      source_todo_id: null,
    });
    if (err) { setError(err.message); return; }
    setForm(emptyForm);
    setShowSheet(false);
    startTransition(refresh);
  };

  const deleteAchievement = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    await db().from('achievements').delete().eq('id', id);
    startTransition(refresh);
  };

  const selectedCommitment = commitments.find(c => c.id === form.commitment_id);

  const filtered = filterCommitment
    ? achievements.filter(a => a.commitment_id === filterCommitment)
    : achievements;

  const byMonth: Record<string, AchievementWithRelations[]> = {};
  filtered.forEach(a => {
    const key = a.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(a);
  });
  const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  const formatMonth = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Achievements</h1>
          <p>Log your wins and track progress over time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSheet(true)}>
          + Log win
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="admin-card admin-card--padded" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-amber)', lineHeight: 1 }}>{achievements.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-2)', marginTop: '0.3rem' }}>Total wins</div>
        </div>
        <div className="admin-card admin-card--padded" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-blue)', lineHeight: 1 }}>{months.length}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-2)', marginTop: '0.3rem' }}>Active months</div>
        </div>
        <div className="admin-card admin-card--padded" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--admin-purple)', lineHeight: 1 }}>
            {achievements.filter(a => a.source_todo_id).length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-2)', marginTop: '0.3rem' }}>From todos</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-row">
        <button className={`filter-chip${!filterCommitment ? ' active' : ''}`} onClick={() => setFilterCommitment('')}>
          All
        </button>
        {commitments.map(c => (
          <button key={c.id}
            className={`filter-chip${filterCommitment === c.id ? ' active' : ''}`}
            onClick={() => setFilterCommitment(filterCommitment === c.id ? '' : c.id)}
            style={filterCommitment === c.id ? { background: c.color, borderColor: c.color } : {}}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Achievement list grouped by month */}
      {months.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏆</div>
          <div className="empty-state__text">No achievements yet.</div>
          <div className="empty-state__sub">Log your first win above.</div>
        </div>
      ) : (
        months.map(month => (
          <div key={month}>
            <div className="month-heading">{formatMonth(month)} · {byMonth[month].length}</div>
            {byMonth[month].map(achievement => (
              <div key={achievement.id} className="achieve-item">
                <div className="achieve-item__icon">🏆</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="achieve-item__title">{achievement.title}</div>
                  <div className="todo-meta">
                    {achievement.source_todo_id && (
                      <span className="chip chip-gray">from todo</span>
                    )}
                    {achievement.commitments && (
                      <span className="chip chip-color" style={{ background: achievement.commitments.color }}>
                        {achievement.commitments.name}
                      </span>
                    )}
                    {achievement.projects && (
                      <span className="chip chip-gray">{achievement.projects.name}</span>
                    )}
                  </div>
                  {achievement.notes && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-3)', marginTop: '0.3rem', lineHeight: 1.5 }}>
                      {achievement.notes}
                    </p>
                  )}
                  <div className="achieve-item__date">{achievement.date}</div>
                </div>
                <button onClick={() => deleteAchievement(achievement.id)} className="btn-icon" title="Delete" style={{ fontSize: '0.8rem', flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        ))
      )}

      {/* FAB */}
      <button className="btn-fab" onClick={() => setShowSheet(true)} aria-label="Log achievement">+</button>

      {/* Sheet */}
      {showSheet && (
        <div className="sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet__handle" />
            <div className="sheet__title">Log achievement</div>
            <div className="form-grid">
              <div className="form-field full">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="What did you accomplish?" autoFocus />
              </div>
              <div className="form-field full">
                <label className="form-label">Notes</label>
                <textarea className="form-input" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Details, context, impact…" rows={2} />
              </div>
              <div className="form-field">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Commitment</label>
                <select className="form-input" value={form.commitment_id}
                  onChange={e => setForm(p => ({ ...p, commitment_id: e.target.value, project_id: '' }))}>
                  <option value="">None</option>
                  {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Project</label>
                <select className="form-input" value={form.project_id}
                  onChange={e => setForm(p => ({ ...p, project_id: e.target.value }))}
                  disabled={!form.commitment_id}>
                  <option value="">None</option>
                  {(selectedCommitment?.projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={addAchievement} disabled={isPending} style={{ flex: 1 }}>
                {isPending ? 'Saving…' : 'Save achievement'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowSheet(false); setForm(emptyForm); setError(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
