'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project, TodoWithRelations } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };

interface Props {
  initialTodos: TodoWithRelations[];
  commitments: CommitmentWithProjects[];
}

type Scope = 'day' | 'week';
type StatusFilter = 'open' | 'completed' | 'all';

const emptyForm = {
  title: '', notes: '', scope: 'day' as Scope,
  commitment_id: '', project_id: '', due_date: '',
};

export default function TodosClient({ initialTodos, commitments }: Props) {
  const [todos, setTodos] = useState(initialTodos);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('open');
  const [filterCommitment, setFilterCommitment] = useState('');
  const [filterScope, setFilterScope] = useState<Scope | ''>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const refresh = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('todos')
      .select('*, commitments(*), projects(*)')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    setTodos(data ?? []);
  };

  const addTodo = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from('todos').insert({
      user_id: user.id,
      title: form.title.trim(),
      notes: form.notes || null,
      scope: form.scope,
      commitment_id: form.commitment_id || null,
      project_id: form.project_id || null,
      due_date: form.due_date || null,
      status: 'open',
    });
    if (err) { setError(err.message); return; }
    setForm(emptyForm);
    setShowForm(false);
    startTransition(refresh);
  };

  const completeTodo = async (todo: TodoWithRelations) => {
    const supabase = createClient();
    await supabase.from('todos').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', todo.id);
    startTransition(refresh);
  };

  const reopenTodo = async (id: string) => {
    const supabase = createClient();
    await supabase.from('todos').update({ status: 'open', completed_at: null }).eq('id', id);
    startTransition(refresh);
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('Delete this todo?')) return;
    const supabase = createClient();
    await supabase.from('todos').delete().eq('id', id);
    startTransition(refresh);
  };

  const convertToAchievement = async (todo: TodoWithRelations) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('achievements').insert({
      user_id: user.id,
      title: todo.title,
      notes: todo.notes,
      commitment_id: todo.commitment_id,
      project_id: todo.project_id,
      source_todo_id: todo.id,
      date: new Date().toISOString().split('T')[0],
    });
    await supabase.from('todos').update({ status: 'archived' }).eq('id', todo.id);
    startTransition(refresh);
  };

  const selectedCommitment = commitments.find(c => c.id === form.commitment_id);

  const filtered = todos.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterCommitment && t.commitment_id !== filterCommitment) return false;
    if (filterScope && t.scope !== filterScope) return false;
    return true;
  });

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>Todos</h1>
          <p style={{ fontSize: '0.88rem', color: '#666' }}>Manage your daily and weekly tasks.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={btnStyle}>
          {showForm ? 'Cancel' : '+ New todo'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem', border: '1.5px solid #ebebeb', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs to be done?" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Optional details…" rows={2}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Scope</label>
              <select value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value as Scope }))} style={inputStyle}>
                <option value="day">Today</option>
                <option value="week">This week</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due date</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} style={inputStyle} />
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
              <select value={form.project_id} onChange={e => setForm(p => ({ ...p, project_id: e.target.value }))} style={inputStyle}
                disabled={!form.commitment_id}>
                <option value="">None</option>
                {(selectedCommitment?.projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p style={{ fontSize: '0.8rem', color: '#cc0000', margin: '0.5rem 0' }}>{error}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={addTodo} disabled={isPending} style={btnStyle}>Save todo</button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setError(''); }}
              style={{ ...btnStyle, background: '#f5f5f5', color: '#333' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {(['open', 'completed', 'all'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ ...filterBtnStyle, background: filterStatus === s ? '#111' : '#fff', color: filterStatus === s ? '#fff' : '#555' }}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <select value={filterCommitment} onChange={e => setFilterCommitment(e.target.value)} style={filterSelectStyle}>
          <option value="">All commitments</option>
          {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterScope} onChange={e => setFilterScope(e.target.value as Scope | '')} style={filterSelectStyle}>
          <option value="">All scopes</option>
          <option value="day">Today</option>
          <option value="week">This week</option>
        </select>
      </div>

      {/* Todo list */}
      <div>
        {filtered.length === 0 && (
          <p style={{ fontSize: '0.85rem', color: '#aaa', textAlign: 'center', padding: '3rem 0' }}>
            No todos match your filters.
          </p>
        )}
        {filtered.map(todo => (
          <div key={todo.id} style={{
            background: '#fff', borderRadius: '8px', padding: '1rem 1.25rem',
            border: '1.5px solid #ebebeb', marginBottom: '0.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            opacity: todo.status === 'completed' ? 0.65 : 1,
          }}>
            <input
              type="checkbox"
              checked={todo.status === 'completed'}
              onChange={() => todo.status === 'completed' ? reopenTodo(todo.id) : completeTodo(todo)}
              style={{ marginTop: '3px', cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, textDecoration: todo.status === 'completed' ? 'line-through' : 'none' }}>
                  {todo.title}
                </span>
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff',
                  background: todo.scope === 'day' ? '#3b82f6' : '#8b5cf6', borderRadius: '999px', padding: '0.1rem 0.45rem' }}>
                  {todo.scope === 'day' ? 'Today' : 'Week'}
                </span>
                {todo.commitments && (
                  <span style={{ fontSize: '0.72rem', color: '#fff', background: todo.commitments.color, borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                    {todo.commitments.name}
                  </span>
                )}
                {todo.projects && (
                  <span style={{ fontSize: '0.72rem', color: '#666', background: '#f0f0f0', borderRadius: '999px', padding: '0.1rem 0.5rem' }}>
                    {todo.projects.name}
                  </span>
                )}
              </div>
              {todo.notes && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{todo.notes}</p>}
              {todo.due_date && <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.15rem' }}>Due {todo.due_date}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
              {todo.status === 'completed' && (
                <button onClick={() => convertToAchievement(todo)}
                  title="Convert to achievement"
                  style={{ ...iconBtnStyle, color: '#f59e0b' }}>
                  🏆
                </button>
              )}
              <button onClick={() => deleteTodo(todo.id)} style={iconBtnStyle} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>
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
const filterBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.85rem', border: '1.5px solid #ddd', borderRadius: '999px',
  fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
};
const filterSelectStyle: React.CSSProperties = {
  padding: '0.4rem 0.75rem', border: '1.5px solid #ddd', borderRadius: '999px',
  fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
};
const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
  color: '#bbb', padding: '0.2rem 0.3rem',
};
