import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service-role client. Used by server-side jobs (cron, sync) that don't
// have a user session. Bypasses RLS — never expose to the client.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
