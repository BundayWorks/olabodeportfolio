import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { buildAuthUrl } from '@/lib/google/oauth';

// Sends the admin user to Google's consent screen.
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const origin = new URL(request.url).origin;
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = buildAuthUrl({ origin, state });

  const res = NextResponse.redirect(authUrl);
  // Short-lived state cookie validated in the callback (CSRF protection)
  res.cookies.set('g_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
