'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid #ddd', borderRadius: '6px',
    fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', marginBottom: '1.25rem',
  };

  const label: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '0.4rem',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/admin/reset-password`;
    // Intentionally ignore the error — we always show the same message
    // so attackers can't probe for valid emails.
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          Check your inbox (and spam folder).
        </p>
        <Link href="/admin" style={{
          display: 'inline-block', fontSize: '0.8rem', fontWeight: 600,
          letterSpacing: '0.06em', color: '#111', borderBottom: '1.5px solid #111',
          paddingBottom: '1px',
        }}>
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label style={label}>Email</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={inputStyle}
        placeholder="you@example.com"
      />
      <button type="submit" disabled={loading} style={{
        width: '100%', padding: '0.75rem', background: '#111', color: '#fff',
        border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
        letterSpacing: '0.06em', cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1, fontFamily: 'inherit', marginBottom: '1.25rem',
      }}>
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
      <Link href="/admin" style={{
        display: 'block', textAlign: 'center', fontSize: '0.8rem', color: '#666',
      }}>
        ← Back to sign in
      </Link>
    </form>
  );
}
