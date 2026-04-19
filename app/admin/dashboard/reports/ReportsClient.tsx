'use client';
import { useState } from 'react';
import type { Commitment, Project, TodoWithRelations, AchievementWithRelations } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };

interface Props {
  todos: TodoWithRelations[];
  achievements: AchievementWithRelations[];
  commitments: CommitmentWithProjects[];
}

export default function ReportsClient({ todos, achievements, commitments }: Props) {
  const [filterCommitment, setFilterCommitment] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const selectedCommitment = commitments.find(c => c.id === filterCommitment);

  const filterTodos = (items: TodoWithRelations[]) => items.filter(t => {
    if (filterCommitment && t.commitment_id !== filterCommitment) return false;
    if (filterProject && t.project_id !== filterProject) return false;
    if (dateFrom && t.created_at.slice(0, 10) < dateFrom) return false;
    if (dateTo && t.created_at.slice(0, 10) > dateTo) return false;
    return true;
  });

  const filterAchievements = (items: AchievementWithRelations[]) => items.filter(a => {
    if (filterCommitment && a.commitment_id !== filterCommitment) return false;
    if (filterProject && a.project_id !== filterProject) return false;
    if (dateFrom && a.date < dateFrom) return false;
    if (dateTo && a.date > dateTo) return false;
    return true;
  });

  const filteredTodos = filterTodos(todos);
  const filteredAchievements = filterAchievements(achievements);
  const openTodos = filteredTodos.filter(t => t.status === 'open');
  const completedTodos = filteredTodos.filter(t => t.status === 'completed');
  const completionRate = filteredTodos.length > 0
    ? Math.round((completedTodos.length / filteredTodos.length) * 100) : 0;

  const commitmentStats = commitments.map(c => {
    const cTodos = filterTodos(todos.filter(t => t.commitment_id === c.id));
    const cAchievements = filterAchievements(achievements.filter(a => a.commitment_id === c.id));
    const total = cTodos.length;
    const done = cTodos.filter(t => t.status === 'completed').length;
    return {
      ...c,
      open: cTodos.filter(t => t.status === 'open').length,
      completed: done,
      achievements: cAchievements.length,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  const hasFilters = filterCommitment || filterProject || dateFrom || dateTo;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reports</h1>
          <p>Holistic view of productivity across all commitments.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card admin-card--padded" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Commitment</label>
            <select className="form-input" value={filterCommitment}
              onChange={e => { setFilterCommitment(e.target.value); setFilterProject(''); }}>
              <option value="">All</option>
              {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Project</label>
            <select className="form-input" value={filterProject}
              onChange={e => setFilterProject(e.target.value)} disabled={!filterCommitment}>
              <option value="">All</option>
              {(selectedCommitment?.projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ minWidth: 140 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="form-field" style={{ minWidth: 140 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          {hasFilters && (
            <button className="btn btn-secondary" onClick={() => { setFilterCommitment(''); setFilterProject(''); setDateFrom(''); setDateTo(''); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Open todos', value: openTodos.length, color: 'var(--admin-blue)' },
          { label: 'Completed', value: completedTodos.length, color: 'var(--admin-green)' },
          { label: 'Achievements', value: filteredAchievements.length, color: 'var(--admin-amber)' },
          { label: 'Completion', value: `${completionRate}%`, color: 'var(--admin-purple)' },
        ].map(s => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat__value" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
            <div className="admin-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall completion bar */}
      {filteredTodos.length > 0 && (
        <div className="admin-card admin-card--padded" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall completion</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-green)' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${completionRate}%`, background: 'var(--admin-green)' }} />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-3)', marginTop: '0.4rem' }}>
            {completedTodos.length} of {filteredTodos.length} todos completed
          </p>
        </div>
      )}

      {/* Commitment breakdown */}
      {!filterCommitment && (
        <div className="admin-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>By commitment</span>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Commitment</th>
                <th>Open</th>
                <th>Done</th>
                <th>Wins</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {commitmentStats.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                      {c.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--admin-blue)', fontWeight: 600 }}>{c.open}</td>
                  <td style={{ color: 'var(--admin-green)', fontWeight: 600 }}>{c.completed}</td>
                  <td style={{ color: 'var(--admin-amber)', fontWeight: 600 }}>{c.achievements}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--admin-bg)', borderRadius: 3, minWidth: 50, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.rate}%`, background: 'var(--admin-green)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-2)', width: 32, textAlign: 'right' }}>{c.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent achievements */}
      {filteredAchievements.length > 0 && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Achievements ({filteredAchievements.length})</span>
          </div>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            {filteredAchievements.slice(0, 20).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid #fafafa' }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🏆</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{a.title}</span>
                  <div className="todo-meta" style={{ marginTop: '0.2rem' }}>
                    {a.commitments && (
                      <span className="chip chip-color" style={{ background: a.commitments.color }}>{a.commitments.name}</span>
                    )}
                    {a.projects && <span className="chip chip-gray">{a.projects.name}</span>}
                    <span className="chip chip-gray">{a.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
