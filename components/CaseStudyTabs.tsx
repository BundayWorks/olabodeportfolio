'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { CaseStudy, ContentBlock } from '@/data/caseStudies';

function renderBlock(block: ContentBlock, i: number) {
  if (block.type === 'paragraph') {
    return <p key={i} dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
  if (block.type === 'callout') {
    return (
      <div key={i} className="callout">
        <p>{block.text}</p>
      </div>
    );
  }
  if (block.type === 'insightList') {
    return (
      <ul key={i} className="insight-list">
        {block.items.map((item, j) => (
          <li key={j}>
            {item.strong ? <><strong>{item.strong}</strong> {item.text}</> : item.text}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'outcomeGrid') {
    return (
      <div key={i} className="outcome-grid">
        {block.items.map((card, j) => (
          <div key={j} className="outcome-card">
            <p className="outcome-card__stat">{card.stat}</p>
            <p className="outcome-card__label">{card.label}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CaseStudyTabs({ study }: { study: CaseStudy }) {
  const [active, setActive] = useState(0);
  const step = study.steps[active];

  return (
    <>
      <div className="cs-steps-bar">
        <div className="cs-steps-bar__inner">
          {study.tabs.map((tab, i) => (
            <button
              key={i}
              className={`step-tab${active === i ? ' active' : ''}`}
              onClick={() => {
                setActive(i);
                const bar = document.querySelector('.cs-steps-bar');
                if (bar) {
                  const offset = bar.getBoundingClientRect().bottom + window.scrollY + 8;
                  window.scrollTo({ top: offset, behavior: 'smooth' });
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="cs-body">
        <section className="cs-step active">
          <p className="cs-step__number">{step.number}</p>
          <h2 className="cs-step__heading">{step.heading}</h2>
          <div className="cs-step__body">
            {step.body.map((block, i) => renderBlock(block, i))}
          </div>
          <div className="cs-step__nav">
            {step.nav.prevStep !== undefined ? (
              <button
                className="cs-step-btn cs-step-btn--ghost"
                onClick={() => setActive(step.nav.prevStep!)}
              >
                {step.nav.prevLabel}
              </button>
            ) : <span />}

            {step.nav.backToWork ? (
              <Link href="/" className="cs-step-btn cs-step-btn--primary">Back to All Work</Link>
            ) : step.nav.nextStep !== undefined ? (
              <button
                className="cs-step-btn cs-step-btn--primary"
                onClick={() => setActive(step.nav.nextStep!)}
              >
                {step.nav.nextLabel}
              </button>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
