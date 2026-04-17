import Link from 'next/link';
import { CASE_STUDY_CARDS } from '@/data/caseStudies';
import CaseStudyVisual from './CaseStudyVisual';

export default function CaseStudies() {
  return (
    <section id="work" className="work container">
      {CASE_STUDY_CARDS.map(card => (
        <article
          key={card.slug}
          className={`case-study case-study--${card.layout} fade-in`}
        >
          {card.layout === 'left' ? (
            <>
              <Link href={`/work/${card.slug}`} className="case-study__visual" style={{ background: card.bgColor }}>
                <CaseStudyVisual type={card.visualType} bgColor={card.bgColor} />
              </Link>
              <div className="case-study__copy">
                <p className="cs-tag">{card.tag}</p>
                <h2>
                  <Link href={`/work/${card.slug}`} className="case-study__title-link">
                    {card.title}
                  </Link>
                </h2>
                <p>{card.description}</p>
                <Link href={`/work/${card.slug}`} className="link">View &rarr;</Link>
              </div>
            </>
          ) : (
            <>
              <div className="case-study__copy">
                <p className="cs-tag">{card.tag}</p>
                <h2>
                  <Link href={`/work/${card.slug}`} className="case-study__title-link">
                    {card.title}
                  </Link>
                </h2>
                <p>{card.description}</p>
                <Link href={`/work/${card.slug}`} className="link">View &rarr;</Link>
              </div>
              <Link href={`/work/${card.slug}`} className="case-study__visual" style={{ background: card.bgColor }}>
                <CaseStudyVisual type={card.visualType} bgColor={card.bgColor} />
              </Link>
            </>
          )}
        </article>
      ))}
    </section>
  );
}
