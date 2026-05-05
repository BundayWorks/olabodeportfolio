import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForToken, fetchGoogleUserInfo } from '@/lib/google/oauth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = request.headers
    .get('cookie')
    ?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('g_oauth_state='))
    ?.split('=')[1];

  const errorRedirect = (msg: string) =>
    NextResponse.redirect(new URL(`/admin/dashboard/integrations?gerr=${encodeURIComponent(msg)}`, url.origin));

  if (!code) return errorRedirect('missing_code');
  if (!state || state !== expectedState) return errorRedirect('state_mismatch');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/admin', url.origin));

  let token;
  try {
    token = await exchangeCodeForToken({ code, origin: url.origin });
  } catch (e) {
    console.error('[google/callback] token exchange failed', e);
    return errorRedirect('token_exchange_failed');
  }

  if (!token.refresh_token) {
    // Happens if the user has previously authorised this app — Google won't
    // re-issue a refresh token unless we revoke first. We requested
    // `prompt=consent` so this should be rare.
    return errorRedirect('no_refresh_token');
  }

  let info: { email: string } = { email: '' };
  try {
    info = await fetchGoogleUserInfo(token.access_token);
  } catch {
    // Non-fatal — we still store the integration even without the email.
  }

  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

  const { error: upsertErr } = await supabase
    .from('user_integrations')
    .upsert(
      {
        user_id: user.id,
        source: 'google_tasks',
        refresh_token: token.refresh_token,
        access_token: token.access_token,
        expires_at: expiresAt,
        scope: token.scope,
        metadata: { email: info.email },
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,source' },
    );

  if (upsertErr) {
    console.error('[google/callback] upsert failed', upsertErr);
    return errorRedirect('storage_failed');
  }

  const res = NextResponse.redirect(new URL('/admin/dashboard/integrations?gconnected=1', url.origin));
  res.cookies.set('g_oauth_state', '', { path: '/', maxAge: 0 });
  return res;
}
