'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: '⚡' },
  { href: '/admin/dashboard/todos', label: 'Todos', icon: '✅' },
  { href: '/admin/dashboard/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/admin/dashboard/commitments', label: 'Commitments', icon: '🗂️' },
  { href: '/admin/dashboard/reports', label: 'Reports', icon: '📊' },
];

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <>
      {navItems.map(item => {
        const active = item.href === '/admin/dashboard'
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`admin-nav-item${active ? ' active' : ''}`}
          >
            <span className="admin-nav-item__icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin');
    router.refresh();
  };

  const SidebarFooter = () => (
    <div className="admin-sidebar__footer">
      <div className="admin-sidebar__email">{userEmail}</div>
      <Link href="/" className="admin-sidebar__link">← View portfolio</Link>
      <button onClick={handleSignOut} className="admin-signout-btn">Sign out</button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">Olabode</div>
          <div className="admin-sidebar__badge">Admin</div>
        </div>
        <nav className="admin-sidebar__nav">
          <NavLinks pathname={pathname} />
        </nav>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="admin-topbar">
        <button className="admin-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <div className="admin-topbar__logo">Olabode</div>
        <div style={{ width: 36 }} />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="admin-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-sidebar__brand">
              <div className="admin-sidebar__logo">Olabode</div>
              <div className="admin-sidebar__badge">Admin</div>
            </div>
            <nav className="admin-sidebar__nav">
              <NavLinks pathname={pathname} onClick={() => setDrawerOpen(false)} />
            </nav>
            <SidebarFooter />
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="admin-bottom-nav">
        <div className="admin-bottom-nav__inner">
          {navItems.map(item => {
            const active = item.href === '/admin/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-bottom-tab${active ? ' active' : ''}`}
              >
                <span className="admin-bottom-tab__icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
