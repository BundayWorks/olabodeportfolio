import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// User-authenticated manual trigger. Forwards to the cron-protected endpoint
// using the server-side CRON_SECRET so we don't expose it to the browser.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL('/api/sync/google-tasks', request.url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
      'x-user-id': user.id,
    },
    cache: 'no-store',
  });

  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
