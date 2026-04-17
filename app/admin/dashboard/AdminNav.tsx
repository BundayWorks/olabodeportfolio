'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: '⚡' },
  { href: '/admin/dashboard/todos', label: 'Todos', icon: '✅' },
  { href: '/admin/dashboard/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/admin/dashboard/commitments', label: 'Commitments', icon: '🗂️' },
  { href: '/admin/dashboard/reports', label: 'Reports', icon: '📊' },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin');
    router.refresh();
  };

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
    }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid #222' }}>
        <div style={{ fontFamily: 'var(--font-playfair, "Playfair Display", serif)', fontStyle: 'italic', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
          Olabode
        </div>
        <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Admin
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navItems.map(item => {
          const active = item.href === '/admin/dashboard'
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                textDecoration: 'none',
                color: active ? '#fff' : '#888',
                background: active ? '#1e1e1e' : 'transparent',
                borderLeft: active ? '3px solid #fff' : '3px solid transparent',
                fontWeight: active ? 600 : 400,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #222' }}>
        <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userEmail}
        </div>
        <Link href="/" style={{ display: 'block', fontSize: '0.78rem', color: '#666', textDecoration: 'none', marginBottom: '0.5rem' }}>
          ← View portfolio
        </Link>
        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: '1px solid #333', color: '#666', borderRadius: '5px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', width: '100%' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
