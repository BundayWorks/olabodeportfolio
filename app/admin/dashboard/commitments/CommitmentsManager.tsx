'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

interface Props {
  initialCommitments: CommitmentWithProjects[];
}

export default function CommitmentsManager({ initialCommitments }: Props) {
  const [commitments, setCommitments] = useState(initialCommitments);
  const [isPending, startTransition] = useTransition();
  const [newCommitment, setNewCommitment] = useState({ name: '', color: COLORS[0] });
  const [newProject, setNewProject] = useState<{ [cid: string]: string }>({});
  const [error, setError] = useState('');

  const refresh = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('commitments').select('*, projects(*)').order('sort_order');
    setCommitments(data ?? []);
  };

  const addCommitment = async () => {
    if (!newCommitment.name.trim()) return;
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const maxOrder = commitments.reduce((m, c) => Math.max(m, c.sort_order), 0);
    const { error: err } = await supabase.from('commitments').insert({
      user_id: user.id,
      name: newCommitment.name.trim(),
      color: newCommitment.color,
      sort_order: maxOrder + 1,
    });
    if (err) { setError(err.message); return; }
    setNewCommitment({ name: '', color: COLORS[0] });
    startTransition(refresh);
  };

  const deleteCommitment = async (id: string) => {
    if (!confirm('Delete this commitment and all its projects?')) return;
    const supabase = createClient();
    await supabase.from('commitments').delete().eq('id', id);
    startTransition(refresh);
  };

  const addProject = async (commitmentId: string) => {
    const name = (newProject[commitmentId] ?? '').trim();
    if (!name) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const commitment = commitments.find(c => c.id === commitmentId);
    const maxOrder = (commitment?.projects ?? []).reduce((m, p) => Math.max(m, p.sort_order), 0);
    await supabase.from('projects').insert({
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
    const supabase = createClient();
    await supabase.from('projects').delete().eq('id', id);
    startTransition(refresh);
  };

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.4rem' }}>Commitments</h1>
      <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '2rem' }}>
        Manage your commitment areas and nested projects.
      </p>

      {/* Add commitment */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', border: '1.5px solid #ebebeb', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Add commitment</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={newCommitment.name}
            onChange={e => setNewCommitment(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addCommitment()}
            placeholder="e.g. Church Work"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewCommitment(p => ({ ...p, color: c }))}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: c, border: 'none',
                  cursor: 'pointer', outline: newCommitment.color === c ? '2px solid #111' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
          <button onClick={addCommitment} disabled={isPending} style={btnStyle}>
            Add
          </button>
        </div>
        {error && <p style={{ fontSize: '0.8rem', color: '#cc0000', marginTop: '0.5rem' }}>{error}</p>}
      </div>

      {/* Commitment list */}
      {commitments.map(commitment => (
        <div key={commitment.id} style={{ background: '#fff', borderRadius: '10px', border: '1.5px solid #ebebeb', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: commitment.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{commitment.name}</span>
              <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{commitment.projects.length} project{commitment.projects.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => deleteCommitment(commitment.id)} style={deleteBtnStyle}>Remove</button>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            {commitment.projects.map(project => (
              <div key={project.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #fafafa' }}>
                <span style={{ fontSize: '0.85rem' }}>{project.name}</span>
                <button onClick={() => deleteProject(project.id)} style={deleteBtnStyle}>Remove</button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <input
                value={newProject[commitment.id] ?? ''}
                onChange={e => setNewProject(p => ({ ...p, [commitment.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addProject(commitment.id)}
                placeholder="Add project…"
                style={{ ...inputStyle, marginBottom: 0, flex: 1, fontSize: '0.82rem' }}
              />
              <button onClick={() => addProject(commitment.id)} disabled={isPending} style={btnStyle}>
                Add
              </button>
            </div>
          </div>
        </div>
      ))}

      {commitments.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>
          No commitments yet. Add one above.
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.55rem 0.8rem', border: '1.5px solid #ddd', borderRadius: '6px',
  fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', marginBottom: 0,
};

const btnStyle: React.CSSProperties = {
  padding: '0.55rem 1rem', background: '#111', color: '#fff', border: 'none',
  borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#aaa', cursor: 'pointer',
  fontSize: '0.78rem', padding: '0.2rem 0.4rem',
};
