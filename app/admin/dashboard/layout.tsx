import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from './AdminNav';
import './admin.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin');

  return (
    <div className="admin-shell">
      <AdminNav userEmail={user.email ?? ''} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
