import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { refreshAccessToken } from '@/lib/google/oauth';
import { listTaskLists, listTasks, type GoogleTask } from '@/lib/google/tasks';

// Buffer access-token expiry by 60s so we don't race the clock.
const TOKEN_REFRESH_SKEW_MS = 60_000;

function authorised(request: Request): boolean {
  // Cron from Vercel arrives with `Authorization: Bearer <CRON_SECRET>`
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Manual sync via the dashboard sends the secret in this header.
  if (request.headers.get('x-cron-secret') === process.env.CRON_SECRET) return true;
  return false;
}

async function getUserIdForSync(request: Request): Promise<string | null> {
  // 1. Explicit override (used by the manual-sync endpoint after it has
  //    already authenticated the user).
  const headerUid = request.headers.get('x-user-id');
  if (headerUid) return headerUid;
  // 2. If a Supabase cookie session is present, use that user.
  try {
    const sb = await createServerClient();
    const { data: { user } } = await sb.auth.getUser();
    if (user) return user.id;
  } catch {}
  // 3. Otherwise (cron) fall back to the configured admin user id.
  return process.env.ADMIN_USER_ID ?? null;
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}

async function runSync(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const userId = await getUserIdForSync(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'no_user' }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Load the integration row
  const { data: integration, error: intErr } = await admin
    .from('user_integrations')
    .select('id, refresh_token, access_token, expires_at')
    .eq('user_id', userId)
    .eq('source', 'google_tasks')
    .maybeSingle();

  if (intErr) {
    return NextResponse.json({ ok: false, error: 'integration_lookup_failed', detail: intErr.message }, { status: 500 });
  }
  if (!integration) {
    return NextResponse.json({ ok: false, error: 'not_connected' }, { status: 404 });
  }

  // 2. Get a valid access token, refreshing if necessary
  let accessToken = integration.access_token ?? null;
  const expiresAtMs = integration.expires_at ? new Date(integration.expires_at).getTime() : 0;
  if (!accessToken || expiresAtMs - Date.now() < TOKEN_REFRESH_SKEW_MS) {
    try {
      const refreshed = await refreshAccessToken(integration.refresh_token);
      accessToken = refreshed.access_token;
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await admin
        .from('user_integrations')
        .update({ access_token: accessToken, expires_at: newExpiresAt })
        .eq('id', integration.id);
    } catch (e) {
      console.error('[sync/google-tasks] refresh failed', e);
      return NextResponse.json({ ok: false, error: 'token_refresh_failed' }, { status: 500 });
    }
  }

  // 3. Pull lists + tasks
  let lists;
  try {
    lists = await listTaskLists(accessToken!);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error('[sync/google-tasks] listTaskLists failed', e);
    return NextResponse.json({ ok: false, error: 'list_lists_failed', detail }, { status: 500 });
  }

  type Row = {
    user_id: string;
    source: 'google_tasks';
    external_id: string;
    list_id: string;
    list_name: string;
    title: string;
    notes: string | null;
    due_at: string | null;
    completed_at: string | null;
    status: 'open' | 'completed';
    raw: GoogleTask;
    synced_at: string;
  };

  const rows: Row[] = [];
  const syncedAt = new Date().toISOString();

  for (const list of lists) {
    let tasks;
    try {
      tasks = await listTasks(accessToken!, list.id);
    } catch (e) {
      console.error(`[sync/google-tasks] listTasks failed for ${list.id}`, e);
      continue;
    }
    for (const t of tasks) {
      rows.push({
        user_id: userId,
        source: 'google_tasks',
        external_id: t.id,
        list_id: list.id,
        list_name: list.title,
        title: t.title?.trim() || '(untitled)',
        notes: t.notes ?? null,
        due_at: t.due ?? null,
        completed_at: t.completed ?? null,
        status: t.status === 'completed' ? 'completed' : 'open',
        raw: t,
        synced_at: syncedAt,
      });
    }
  }

  // 4. Upsert
  let upserted = 0;
  if (rows.length > 0) {
    const { error: upErr, count } = await admin
      .from('external_todos')
      .upsert(rows, { onConflict: 'source,external_id', count: 'exact' });
    if (upErr) {
      console.error('[sync/google-tasks] upsert failed', upErr);
      return NextResponse.json({ ok: false, error: 'upsert_failed', detail: upErr.message }, { status: 500 });
    }
    upserted = count ?? rows.length;
  }

  // 5. Delete tasks that no longer exist in Google (cleanup)
  if (rows.length > 0) {
    const externalIds = rows.map(r => r.external_id);
    await admin
      .from('external_todos')
      .delete()
      .eq('user_id', userId)
      .eq('source', 'google_tasks')
      .not('external_id', 'in', `(${externalIds.map(id => `"${id}"`).join(',')})`);
  } else {
    // No tasks at all — clear everything for this source/user
    await admin
      .from('external_todos')
      .delete()
      .eq('user_id', userId)
      .eq('source', 'google_tasks');
  }

  await admin
    .from('user_integrations')
    .update({ last_synced_at: syncedAt })
    .eq('id', integration.id);

  return NextResponse.json({
    ok: true,
    lists: lists.length,
    tasks: rows.length,
    upserted,
    synced_at: syncedAt,
  });
}
