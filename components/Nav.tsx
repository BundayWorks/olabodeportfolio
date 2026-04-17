'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <Link href="/" className="nav__logo">Olabode</Link>
      <button className="nav__menu-btn" aria-label="Open menu" onClick={() => setOpen(o => !o)}>
        &#9776;
      </button>
      <nav className={`nav__links${open ? ' open' : ''}`}>
        <a href="#work" onClick={() => setOpen(false)}>Work</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}
