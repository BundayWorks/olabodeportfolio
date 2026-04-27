'use client';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const CV_URL = '/assets/Olabode_Ogunfuye_CV.pdf';
const CV_FILENAME = 'Olabode_Ogunfuye_CV.pdf';
const OPEN_EVENT = 'open-cv-modal';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 700;
}

// Public trigger — call from anywhere in the app to open the modal
export function openCVModal() {
  if (typeof window === 'undefined') return;
  if (isMobileViewport()) {
    window.open(CV_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function CVModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(isMobileViewport());
    const onResize = () => setIsMobile(isMobileViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
  }, []);

  const openModal = useCallback(() => {
    if (isMobile) {
      window.open(CV_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }, [isMobile]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  // Listen for cross-component open requests (e.g. from Nav)
  useEffect(() => {
    const handler = () => openModal();
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, [openModal]);

  const modal = (
    <div className={`cv-modal${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="CV viewer">
      <div className="cv-modal__backdrop" onClick={close} />
      <div className="cv-modal__box">
        <div className="cv-modal__header">
          <p className="cv-modal__title">Olabode Ogunfuye — CV</p>
          <button className="cv-modal__close" aria-label="Close" onClick={close}>&times;</button>
        </div>
        <div className="cv-modal__viewer">
          <iframe
            src={`${CV_URL}#toolbar=0&navpanes=0&view=FitH`}
            title="Olabode Ogunfuye CV"
            className="cv-modal__iframe"
          />
        </div>
        <div className="cv-modal__footer">
          <a
            href={CV_URL}
            download={CV_FILENAME}
            className="cv-modal__download"
          >
            ↓ Download PDF
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" className="hero__cta hero__cta--ghost" onClick={openModal}>
        VIEW CV
      </button>
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
