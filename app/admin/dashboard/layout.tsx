import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from './AdminNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      background: '#f5f5f5',
    }}>
      <AdminNav userEmail={user.email ?? ''} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
