import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revokeToken } from '@/lib/google/oauth';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const { data: integration } = await supabase
    .from('user_integrations')
    .select('refresh_token, access_token')
    .eq('user_id', user.id)
    .eq('source', 'google_tasks')
    .maybeSingle();

  if (integration?.refresh_token) {
    try { await revokeToken(integration.refresh_token); } catch {}
  }

  await supabase
    .from('user_integrations')
    .delete()
    .eq('user_id', user.id)
    .eq('source', 'google_tasks');

  // Also wipe the cached items so the dashboard reflects disconnection.
  await supabase
    .from('external_todos')
    .delete()
    .eq('user_id', user.id)
    .eq('source', 'google_tasks');

  return NextResponse.redirect(new URL('/admin/dashboard/integrations?gdisconnected=1', request.url), 303);
}
