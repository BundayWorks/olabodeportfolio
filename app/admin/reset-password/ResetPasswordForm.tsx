'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MIN_LENGTH = 8;

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid #ddd', borderRadius: '6px',
    fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', marginBottom: '1rem',
  };

  const label: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '0.4rem',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message || 'Could not update password. Please try again.');
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label style={label}>New password</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={MIN_LENGTH}
        style={inputStyle}
        placeholder="••••••••"
      />
      <label style={label}>Confirm password</label>
      <input
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
        minLength={MIN_LENGTH}
        style={{ ...inputStyle, marginBottom: error ? '0.75rem' : '1.5rem' }}
        placeholder="••••••••"
      />
      {error && <p style={{ fontSize: '0.8rem', color: '#cc0000', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{
        width: '100%', padding: '0.75rem', background: '#111', color: '#fff',
        border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
        letterSpacing: '0.06em', cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
      }}>
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
