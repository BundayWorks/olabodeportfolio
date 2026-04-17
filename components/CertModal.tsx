'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CERTS, CERT_BADGES } from '@/data/certs';

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2" />
      <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function CertModal() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Wait for client mount before using createPortal
  useEffect(() => { setMounted(true); }, []);

  const cert = openKey ? CERTS[openKey] : null;
  const images = cert?.images ?? [];
  const item = images[index];

  const close = useCallback(() => {
    setOpenKey(null);
    document.body.style.overflow = '';
  }, []);

  const open = (key: string) => {
    setOpenKey(key);
    setIndex(0);
    setScale(1);
    document.body.style.overflow = 'hidden';
  };

  const setZoom = useCallback((z: number) => {
    const clamped = Math.min(Math.max(z, 0.5), 3);
    setScale(clamped);
    if (imgRef.current) {
      imgRef.current.style.transform = `scale(${clamped})`;
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!openKey) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' && index > 0) setIndex(i => i - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) setIndex(i => i + 1);
      if (e.key === '+' || e.key === '=') setZoom(scale + 0.25);
      if (e.key === '-') setZoom(scale - 0.25);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openKey, index, images.length, scale, close, setZoom]);

  useEffect(() => {
    setScale(1);
    if (imgRef.current) imgRef.current.style.transform = 'scale(1)';
  }, [index, openKey]);

  const modal = (
    <div className={`cert-modal${openKey ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Certificate viewer">
      <div className="cert-modal__backdrop" onClick={close} />
      <div className="cert-modal__box">
        <button className="cert-modal__close" aria-label="Close" onClick={close}>&times;</button>
        <div className="cert-modal__header">
          <p className="cert-modal__title">{cert?.title}</p>
          {images.length > 1 && (
            <span className="cert-modal__counter">{index + 1} / {images.length}</span>
          )}
        </div>
        <div className="cert-modal__viewer">
          {images.length > 1 && (
            <button
              className="cert-modal__nav"
              style={{ display: 'flex' }}
              disabled={index === 0}
              onClick={() => setIndex(i => i - 1)}
              aria-label="Previous"
            >&#8592;</button>
          )}
          <div className="cert-modal__img-wrap">
            {item ? (
              <img
                ref={imgRef}
                className="cert-modal__img"
                src={item.src}
                alt={item.label}
                draggable={false}
              />
            ) : (
              <div className="cert-modal__placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="1.5" />
                  <path d="M8 12l3 3 5-5" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>Certificate image coming soon</p>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <button
              className="cert-modal__nav"
              style={{ display: 'flex' }}
              disabled={index === images.length - 1}
              onClick={() => setIndex(i => i + 1)}
              aria-label="Next"
            >&#8594;</button>
          )}
        </div>

        {item && (
          <>
            {item.url ? (
              <a
                className="cert-modal__img-label cert-modal__img-label--link"
                style={{ display: 'block' }}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ View public credential
              </a>
            ) : (
              <span className="cert-modal__img-label" style={{ display: 'block' }}>
                {item.label}
              </span>
            )}
            <div className="cert-modal__controls" style={{ display: 'flex' }}>
              <button className="cert-modal__zoom-btn" onClick={() => setZoom(scale - 0.25)} aria-label="Zoom out">−</button>
              <span className="cert-modal__zoom-level">{Math.round(scale * 100)}%</span>
              <button className="cert-modal__zoom-btn" onClick={() => setZoom(scale + 0.25)} aria-label="Zoom in">+</button>
              <button className="cert-modal__zoom-btn" onClick={() => setZoom(1)} aria-label="Reset zoom" title="Reset">↺</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Cert badges */}
      <div className="hero__certs">
        <p className="hero__certs-label">Certifications</p>
        <div className="hero__certs-badges">
          {CERT_BADGES.map(b => {
            if (b.noClick) {
              return (
                <span key={b.key} className="cert-badge cert-badge--pending cert-badge--no-click">
                  <PendingIcon />
                  {b.label} <em>({b.inProgressLabel})</em>
                </span>
              );
            }
            return (
              <button
                key={b.key}
                className={`cert-badge${b.pending ? ' cert-badge--pending' : ''}`}
                aria-label={`View ${b.label} certificate`}
                onClick={() => open(b.key)}
              >
                {b.pending ? <PendingIcon /> : <CheckIcon />}
                {b.label}
                {b.inProgressLabel && <em> ({b.inProgressLabel})</em>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Portal renders modal directly into document.body — escapes all ancestor constraints */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
