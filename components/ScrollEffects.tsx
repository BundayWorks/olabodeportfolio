'use client';
import { useEffect } from 'react';

export default function ScrollEffects() {
  useEffect(() => {
    // Fade-in on scroll
    const fadeEls = document.querySelectorAll<HTMLElement>('.fade-in');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeEls.forEach(el => observer.observe(el));

    // Active nav highlight on scroll
    const sections = document.querySelectorAll<HTMLElement>('section[id], footer[id]');
    const navAnchors = document.querySelectorAll<HTMLAnchorElement>('.nav__links a[href^="#"]');
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navAnchors.forEach(a => (a.style.fontWeight = '400'));
            const active = document.querySelector<HTMLAnchorElement>(
              `.nav__links a[href="#${entry.target.id}"]`
            );
            if (active) active.style.fontWeight = '600';
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(s => sectionObserver.observe(s));

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return null;
}
