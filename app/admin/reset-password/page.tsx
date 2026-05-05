import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata = { title: 'Choose a new password — Olabode' };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Only accessible via a valid recovery session (set by the callback route).
  if (!user) redirect('/admin');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2.5rem',
        width: 'min(400px, 92vw)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", serif)',
            fontStyle: 'italic',
            fontSize: '1.5rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
          }}>Olabode</p>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>
            Choose a new password for {user.email}.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
