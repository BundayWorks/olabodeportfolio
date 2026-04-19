'use client';
import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Commitment, Project, TodoWithRelations } from '@/lib/supabase/types';

type CommitmentWithProjects = Commitment & { projects: Project[] };
type Scope = 'day' | 'week';
type StatusFilter = 'open' | 'completed' | 'all';

interface Props {
  initialTodos: TodoWithRelations[];
  commitments: CommitmentWithProjects[];
}

const emptyForm = {
  title: '', notes: '', scope: 'day' as Scope,
  commitment_id: '', project_id: '', due_date: '',
};

function getWeekDays(anchor: Date) {
  const days = [];
  const start = new Date(anchor);
  const dow = start.getDay();
  start.setDate(start.getDate() - dow);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function TodosClient({ initialTodos, commitments }: Props) {
  const [todos, setTodos] = useState(initialTodos);
  const [form, setForm] = useState(emptyForm);
  const [showSheet, setShowSheet] = useState(false);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('open');
  const [filterCommitment, setFilterCommitment] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(isoDate(new Date()));
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const today = isoDate(new Date());
  const weekDays = getWeekDays(weekAnchor);

  const prevWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
  const nextWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };
  const goToday = () => { setWeekAnchor(new Date()); setSelectedDate(today); };

  const refresh = async () => {
    const { data } = await db()
      .from('todos').select('*, commitments(*), projects(*)')
      .neq('status', 'archived').order('created_at', { ascending: false });
    setTodos(data ?? []);
  };

  const addTodo = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setError('');
    const { data: { user } } = await db().auth.getUser();
    if (!user) return;
    await db().from('todos').insert({
      user_id: user.id,
      title: form.title.trim(),
      notes: form.notes || null,
      scope: form.scope,
      commitment_id: form.commitment_id || null,
      project_id: form.project_id || null,
      due_date: form.due_date || selectedDate,
      status: 'open',
    });
    setForm(emptyForm);
    setShowSheet(false);
    startTransition(refresh);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = () => (createClient() as any);

  const completeTodo = async (todo: TodoWithRelations) => {
    await db().from('todos').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', todo.id);
    startTransition(refresh);
  };

  const reopenTodo = async (id: string) => {
    await db().from('todos').update({ status: 'open', completed_at: null }).eq('id', id);
    startTransition(refresh);
  };

  const deleteTodo = async (id: string) => {
    if (!confirm('Delete this todo?')) return;
    await db().from('todos').delete().eq('id', id);
    startTransition(refresh);
  };

  const convertToAchievement = async (todo: TodoWithRelations) => {
    const { data: { user } } = await db().auth.getUser();
    if (!user) return;
    await db().from('achievements').insert({
      user_id: user.id, title: todo.title, notes: todo.notes,
      commitment_id: todo.commitment_id, project_id: todo.project_id,
      source_todo_id: todo.id, date: today,
    });
    await db().from('todos').update({ status: 'archived' }).eq('id', todo.id);
    startTransition(refresh);
  };

  const selectedCommitment = commitments.find(c => c.id === form.commitment_id);

  // Dot map: date → has todos
  const dotDates = new Set(todos.filter(t => t.due_date && t.status !== 'archived').map(t => t.due_date));

  const filtered = todos.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterCommitment && t.commitment_id !== filterCommitment) return false;
    if (selectedDate && t.due_date !== selectedDate) return false;
    return true;
  });

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabel = weekDays[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Todos</h1>
          <p>Plan your day and week across commitments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSheet(true)}>
          + New todo
        </button>
      </div>

      {/* Week calendar */}
      <div className="week-calendar">
        <div className="week-calendar__header">
          <span className="week-calendar__title">{monthLabel}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={goToday} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', borderRadius: '6px' }}>
              Today
            </button>
            <div className="week-calendar__nav">
              <button className="btn-icon" onClick={prevWeek}>‹</button>
              <button className="btn-icon" onClick={nextWeek}>›</button>
            </div>
          </div>
        </div>
        <div className="week-calendar__days">
          {weekDays.map((d, i) => {
            const ds = isoDate(d);
            const isToday = ds === today;
            const isSelected = ds === selectedDate;
            const hasDot = dotDates.has(ds);
            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(ds === selectedDate ? '' : ds)}
                className={`week-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                style={{ border: 'none', fontFamily: 'inherit' }}
              >
                <span className="week-day__name">{DAYS[i]}</span>
                <span className="week-day__num">{d.getDate()}</span>
                {hasDot && <span className="week-day__dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        {(['open', 'completed', 'all'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`filter-chip${filterStatus === s ? ' active' : ''}`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <select value={filterCommitment} onChange={e => setFilterCommitment(e.target.value)} className="filter-select">
          <option value="">All commitments</option>
          {commitments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedDate && (
          <button className="filter-chip" onClick={() => setSelectedDate('')} style={{ color: 'var(--admin-blue)', borderColor: 'var(--admin-blue)' }}>
            {selectedDate === today ? 'Today' : selectedDate} ✕
          </button>
        )}
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">✅</div>
          <div className="empty-state__text">
            {selectedDate ? `No todos for ${selectedDate === today ? 'today' : selectedDate}` : 'No todos match your filters.'}
          </div>
          <div className="empty-state__sub">Tap "+ New todo" to add one.</div>
        </div>
      ) : (
        filtered.map(todo => (
          <div key={todo.id} className={`todo-item${todo.status === 'completed' ? ' completed' : ''}`}>
            <input
              type="checkbox"
              className="todo-checkbox"
              checked={todo.status === 'completed'}
              onChange={() => todo.status === 'completed' ? reopenTodo(todo.id) : completeTodo(todo)}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={`todo-title${todo.status === 'completed' ? ' strikethrough' : ''}`}>
                {todo.title}
              </div>
              <div className="todo-meta">
                <span className={`chip ${todo.scope === 'day' ? 'chip-blue' : 'chip-purple'}`}>
                  {todo.scope === 'day' ? 'Today' : 'Week'}
                </span>
                {todo.commitments && (
                  <span className="chip chip-color" style={{ background: todo.commitments.color }}>
                    {todo.commitments.name}
                  </span>
                )}
                {todo.projects && (
                  <span className="chip chip-gray">{todo.projects.name}</span>
                )}
                {todo.due_date && todo.due_date !== today && (
                  <span className="chip chip-gray">Due {todo.due_date}</span>
                )}
              </div>
              {todo.notes && (
                <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-3)', marginTop: '0.3rem', lineHeight: 1.5 }}>{todo.notes}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.15rem', flexShrink: 0 }}>
              {todo.status === 'completed' && (
                <button onClick={() => convertToAchievement(todo)} className="btn-icon" title="Convert to achievement" style={{ fontSize: '1rem' }}>
                  🏆
                </button>
              )}
              <button onClick={() => deleteTodo(todo.id)} className="btn-icon" title="Delete" style={{ fontSize: '0.8rem' }}>
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      {/* FAB (mobile) */}
      <button className="btn-fab" onClick={() => setShowSheet(true)} aria-label="New todo">+</button>

      {/* Sheet modal */}
      {showSheet && (
        <div className="sheet-overlay" onClick={() => setShowSheet(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet__handle" />
            <div className="sheet__title">New todo</div>

            <div className="form-grid">
              <div className="form-field full">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                  autoFocus />
              </div>
              <div className="form-field full">
                <label className="form-label">Notes</label>
                <textarea className="form-input" value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional details…" rows={2} />
              </div>
              <div className="form-field">
                <label className="form-label">Scope</label>
                <select className="form-input" value={form.scope}
                  onChange={e => setForm(p => ({ ...p, scope: e.target.value as Scope }))}>
                  <option value="day">Today</option>
                  <option value="week">This week</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Due date</label>
                <input type="date" className="form-input" value={form.due_date || selectedDate}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
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
              <button className="btn btn-primary" onClick={addTodo} disabled={isPending} style={{ flex: 1 }}>
                {isPending ? 'Saving…' : 'Save todo'}
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
