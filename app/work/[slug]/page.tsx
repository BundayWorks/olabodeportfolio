import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CASE_STUDIES } from '@/data/caseStudies';
import CaseStudyTabs from '@/components/CaseStudyTabs';
import './case-study.css';

export function generateStaticParams() {
  return CASE_STUDIES.map(cs => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES.find(cs => cs.slug === slug);
  if (!study) return {};
  return { title: `${study.title} — Olabode Ogunfuye` };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = CASE_STUDIES.find(cs => cs.slug === slug);
  if (!study) notFound();

  return (
    <>
      <nav className="cs-nav">
        <Link href="/" className="cs-nav__logo">Olabode</Link>
        <Link href="/" className="cs-nav__back">&#8592; All Work</Link>
      </nav>

      <header className="cs-hero">
        <p className="cs-hero__tag">{study.tag}</p>
        <h1 className="cs-hero__title">{study.title}</h1>
        <p className="cs-hero__summary">{study.summary}</p>
        <div className="cs-hero__meta">
          {study.meta.map(m => (
            <div key={m.label} className="cs-meta-item">
              <p className="cs-meta-item__label">{m.label}</p>
              <p className="cs-meta-item__value">{m.value}</p>
            </div>
          ))}
        </div>
      </header>

      <CaseStudyTabs study={study} />

      <footer className="cs-footer">
        <p>Want to discuss this work or explore collaborating?</p>
        <a href="mailto:olabode.ogunfuye@gmail.com">Get in touch &rarr;</a>
      </footer>
    </>
  );
}
