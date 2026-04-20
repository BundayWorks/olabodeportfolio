'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  // On mount, read stored preference; default to dark
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : true;
    setDark(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <header className="nav">
      <Link href="/" className="nav__logo">Olabode</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <nav className={`nav__links${open ? ' open' : ''}`}>
          <a href="#work" onClick={() => setOpen(false)}>Work</a>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
        <button
          className="nav__theme-btn"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button className="nav__menu-btn" aria-label="Open menu" onClick={() => setOpen(o => !o)}>
          &#9776;
        </button>
      </div>
    </header>
  );
}
