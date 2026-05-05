import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ImportPayload {
  title?: string;
  notes?: string | null;
  scope: 'day' | 'week';
  due_date?: string | null;
  commitment_id?: string | null;
  project_id?: string | null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: ImportPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  if (body.scope !== 'day' && body.scope !== 'week') {
    return NextResponse.json({ ok: false, error: 'invalid_scope' }, { status: 400 });
  }

  // 1. Load the external_todo (must belong to current user)
  const { data: ext, error: extErr } = await supabase
    .from('external_todos')
    .select('id, title, notes, due_at, imported_todo_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (extErr || !ext) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  if (ext.imported_todo_id) {
    return NextResponse.json({ ok: false, error: 'already_imported' }, { status: 409 });
  }

  // 2. Insert into manual todos
  const title = body.title?.trim() || ext.title;
  const insertPayload = {
    user_id: user.id,
    title,
    notes: body.notes ?? ext.notes ?? null,
    scope: body.scope,
    due_date: body.due_date || (ext.due_at ? ext.due_at.slice(0, 10) : null),
    commitment_id: body.commitment_id || null,
    project_id: body.project_id || null,
    status: 'open' as const,
  };

  const { data: newTodo, error: insErr } = await supabase
    .from('todos')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insErr || !newTodo) {
    return NextResponse.json({ ok: false, error: 'insert_failed', detail: insErr?.message }, { status: 500 });
  }

  // 3. Mark the external_todo as imported so it's filtered out of future syncs / lists
  await supabase
    .from('external_todos')
    .update({ imported_todo_id: newTodo.id })
    .eq('id', ext.id);

  return NextResponse.json({ ok: true, todo_id: newTodo.id });
}
