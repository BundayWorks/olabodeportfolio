'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid #ddd', borderRadius: '6px',
    fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', marginBottom: '1rem',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('Incorrect email or password.');
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  const label: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '0.4rem',
  };

  return (
    <form onSubmit={handleSubmit}>
      <label style={label}>Email</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        required style={inputStyle} placeholder="you@example.com" />
      <label style={label}>Password</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        required style={{ ...inputStyle, marginBottom: error ? '0.75rem' : '1.5rem' }}
        placeholder="••••••••" />
      {error && <p style={{ fontSize: '0.8rem', color: '#cc0000', marginBottom: '1rem' }}>{error}</p>}
      <button type="submit" disabled={loading} style={{
        width: '100%', padding: '0.75rem', background: '#111', color: '#fff',
        border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600,
        letterSpacing: '0.06em', cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
      }}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
