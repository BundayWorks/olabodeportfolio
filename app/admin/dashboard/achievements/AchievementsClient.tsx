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

export default function AchievementsClient({ initialAchievements, commitments }: Props) {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterCommitment, setFilterCommitment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const refresh = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('achievements')
      .select('*, commitments(*), projects(*)')
      .order('date', { ascending: false });
    setAchievements(data ?? []);
  };

  const addAchievement = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.date) { setError('Date is required.'); return; }
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from('achievements').insert({
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
    setShowForm(false);
    startTransition(refresh);
  };

  const deleteAchievement = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    const supabase = createClient();
    await supabase.from('achievements').delete().eq('id', id);
    startTransition(refresh);
  };

  const selectedCommitment = commitments.find(c => c.id === form.commitment_id);

  const filtered = filterCommitment
    ? achievements.filter(a => a.commitment_id === filterCommitment)
    : achievements;

  // Group by month
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
    <div style={{ padding: '2.5rem 2rem', maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>Achievements</h1>
          <p style={{ fontSize: '0.88rem', color: '#666' }}>Log wins and track progress over time.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={btnStyle}>
          {showForm ? 'Cancel' : '+ Log achievement'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', border: '1.5px solid #ebebeb', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What did you accomplish?" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Details, context, impact…" rows={2}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Commitment</label>
              <select value={form.commitment_id}
                onChange={e => setForm(p => ({ ...p, commitment_id: e.target.value, project_id: '' }))}
                style={inputStyle}>
                <option value="">None</option>
                {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project</label>
              <select value={form.project_id} onChange={e => setForm(p => ({ ...p, project_id: e.target.value }))}
                style={inputStyle} disabled={!form.commitment_id}>
                <option value="">None</option>
                {(selectedCommitment?.projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p style={{ fontSize: '0.8rem', color: '#cc0000', margin: '0.5rem 0' }}>{error}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={addAchievement} disabled={isPending} style={btnStyle}>Save</button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setError(''); }}
              style={{ ...btnStyle, background: '#f5f5f5', color: '#333' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <select value={filterCommitment} onChange={e => setFilterCommitment(e.target.value)} style={filterSelectStyle}>
          <option value="">All commitments</option>
          {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Achievement list grouped by month */}
      {months.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>
          No achievements yet. Log your first win above.
        </p>
      )}
      {months.map(month => (
        <div key={month} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.75rem' }}>
            {formatMonth(month)}
          </h2>
          {byMonth[month].map(achievement => (
            <div key={achievement.id} style={{
              background: '#fff', borderRadius: '8px', padding: '1rem 1.25rem',
              border: '1.5px solid #ebebeb', marginBottom: '0.5rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🏆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{achievement.title}</span>
                  {achievement.source_todo_id && (
                    <span style={{ fontSize: '0.68rem', color: '#aaa', background: '#f5f5f5', borderRadius: '999px', padding: '0.1rem 0.45rem' }}>
                      from todo
                    </span>
                  )}
                  {achievement.commitments && (
                    <span style={{ fontSize: '0.72rem', color: '#fff', background: achievement.commitments.color, borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                      {achievement.commitments.name}
                    </span>
                  )}
                  {achievement.projects && (
                    <span style={{ fontSize: '0.72rem', color: '#666', background: '#f0f0f0', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                      {achievement.projects.name}
                    </span>
                  )}
                </div>
                {achievement.notes && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{achievement.notes}</p>}
                <p style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '0.15rem' }}>{achievement.date}</p>
              </div>
              <button onClick={() => deleteAchievement(achievement.id)} style={iconBtnStyle} title="Delete">✕</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid #ddd',
  borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.07em',
  textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '0.35rem',
};
const btnStyle: React.CSSProperties = {
  padding: '0.6rem 1.1rem', background: '#111', color: '#fff', border: 'none',
  borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};
const filterSelectStyle: React.CSSProperties = {
  padding: '0.4rem 0.75rem', border: '1.5px solid #ddd', borderRadius: '999px',
  fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
};
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
  color: '#bbb', padding: '0.2rem 0.3rem', flexShrink: 0,
};
