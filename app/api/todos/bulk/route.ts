import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBulkRow, type BulkRowInput, type CommitmentRef } from '@/lib/bulk-todos';

const MAX_ROWS = 500;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { rows?: BulkRowInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: 'no_rows' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ ok: false, error: 'too_many_rows', max: MAX_ROWS }, { status: 400 });
  }

  // Re-fetch commitments and projects on the server so we can't be tricked into
  // inserting against IDs the user couldn't normally see.
  const { data: commitmentsData } = await supabase
    .from('commitments')
    .select('id, name, projects(id, name)')
    .order('sort_order');

  const commitments: CommitmentRef[] = (commitmentsData ?? []).map(c => ({
    id: c.id,
    name: c.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects: ((c as any).projects ?? []).map((p: { id: string; name: string }) => ({
      id: p.id,
      name: p.name,
    })),
  }));

  const todayIso = new Date().toISOString().slice(0, 10);
  const validated = rows.map((r, i) => validateBulkRow(r, i + 1, commitments, todayIso));
  const valid = validated.filter(v => v.resolved && v.errors.length === 0);
  const invalid = validated.filter(v => !v.resolved || v.errors.length > 0);

  if (valid.length === 0) {
    return NextResponse.json({
      ok: false,
      error: 'no_valid_rows',
      errors: invalid.map(v => ({ row: v.rowNumber, errors: v.errors })),
    }, { status: 400 });
  }

  const insertRows = valid.map(v => ({
    user_id: user.id,
    title: v.resolved!.title,
    notes: v.resolved!.notes,
    scope: v.resolved!.scope,
    due_date: v.resolved!.due_date,
    commitment_id: v.resolved!.commitment_id,
    project_id: v.resolved!.project_id,
    status: 'open' as const,
  }));

  const { error: insErr, count } = await supabase
    .from('todos')
    .insert(insertRows, { count: 'exact' });

  if (insErr) {
    return NextResponse.json({
      ok: false, error: 'insert_failed', detail: insErr.message,
    }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    inserted: count ?? insertRows.length,
    skipped: invalid.length,
    errors: invalid.map(v => ({ row: v.rowNumber, errors: v.errors })),
  });
}
