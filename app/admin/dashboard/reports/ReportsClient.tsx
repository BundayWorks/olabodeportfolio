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

  // Commitment breakdown
  const commitmentStats = commitments.map(c => {
    const cTodos = filterTodos(todos.filter(t => t.commitment_id === c.id));
    const cAchievements = filterAchievements(achievements.filter(a => a.commitment_id === c.id));
    return {
      ...c,
      open: cTodos.filter(t => t.status === 'open').length,
      completed: cTodos.filter(t => t.status === 'completed').length,
      achievements: cAchievements.length,
    };
  }).filter(c => c.open + c.completed + c.achievements > 0 || !filterCommitment);

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '920px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reports</h1>
      <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '2rem' }}>
        Holistic view of your productivity across commitments and projects.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', background: '#fff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1.5px solid #ebebeb' }}>
        <div>
          <label style={labelStyle}>Commitment</label>
          <select value={filterCommitment}
            onChange={e => { setFilterCommitment(e.target.value); setFilterProject(''); }}
            style={selectStyle}>
            <option value="">All</option>
            {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Project</label>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={selectStyle} disabled={!filterCommitment}>
            <option value="">All</option>
            {(selectedCommitment?.projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={selectStyle} />
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={selectStyle} />
        </div>
        {(filterCommitment || filterProject || dateFrom || dateTo) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterCommitment(''); setFilterProject(''); setDateFrom(''); setDateTo(''); }}
              style={{ padding: '0.45rem 0.85rem', background: '#f5f5f5', border: 'none', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Open todos', value: openTodos.length, color: '#3b82f6' },
          { label: 'Completed todos', value: completedTodos.length, color: '#22c55e' },
          { label: 'Achievements', value: filteredAchievements.length, color: '#f59e0b' },
          { label: 'Completion rate', value: filteredTodos.length > 0 ? `${Math.round(completedTodos.length / filteredTodos.length * 100)}%` : '—', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem', border: '1.5px solid #ebebeb' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, marginBottom: '0.2rem' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Commitment breakdown */}
      {!filterCommitment && (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1.5px solid #ebebeb', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>By commitment</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={thStyle}>Commitment</th>
                <th style={thStyle}>Open</th>
                <th style={thStyle}>Completed</th>
                <th style={thStyle}>Achievements</th>
              </tr>
            </thead>
            <tbody>
              {commitmentStats.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                      {c.name}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: '#3b82f6', fontWeight: 600 }}>{c.open}</td>
                  <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 600 }}>{c.completed}</td>
                  <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 600 }}>{c.achievements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent achievements */}
      {filteredAchievements.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '10px', border: '1.5px solid #ebebeb', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Achievements ({filteredAchievements.length})</h2>
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            {filteredAchievements.slice(0, 20).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid #fafafa' }}>
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>🏆</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{a.title}</span>
                  {a.commitments && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#fff', background: a.commitments.color, borderRadius: '999px', padding: '0.1rem 0.45rem' }}>
                      {a.commitments.name}
                    </span>
                  )}
                  {a.projects && (
                    <span style={{ marginLeft: '0.35rem', fontSize: '0.7rem', color: '#666', background: '#f0f0f0', borderRadius: '999px', padding: '0.1rem 0.45rem' }}>
                      {a.projects.name}
                    </span>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '0.15rem' }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
  color: '#666', display: 'block', marginBottom: '0.3rem',
};
const selectStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem', border: '1.5px solid #ddd', borderRadius: '6px',
  fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none',
};
const thStyle: React.CSSProperties = {
  padding: '0.65rem 1.25rem', textAlign: 'left', fontSize: '0.75rem',
  fontWeight: 600, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase',
};
const tdStyle: React.CSSProperties = {
  padding: '0.7rem 1.25rem', fontSize: '0.85rem', color: '#333',
};
