import Nav from '@/components/Nav';
import CertModal from '@/components/CertModal';
import CVModal from '@/components/CVModal';
import CaseStudies from '@/components/CaseStudies';
import Footer from '@/components/Footer';
import ScrollEffects from '@/components/ScrollEffects';

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero container fade-in">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="hero__label">PRODUCT &amp; TRANSFORMATION LEADER</p>
            <h1 className="hero__headline">
              I&apos;m Olabode — I don&apos;t just ship products.<br />
              I make sure <span className="underline">people actually use them.</span>
            </h1>
            <p className="hero__sub">
              12+ years building products and leading change across fintech, government, health, and
              logistics in West Africa. I work at the intersection of product strategy, customer
              experience design, and agile delivery — from first insight to lasting adoption.
            </p>
            <div className="hero__cta-row">
              <a href="#work" className="hero__cta">SEE MY WORK &rarr;</a>
              <CVModal />
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__visual-frame">
              <img src="/assets/Hero Image.png" alt="Olabode Ogunfuye" className="hero__image" />
            </div>
          </div>
        </div>

        {/* Cert badges + modal rendered together as a client component */}
        <CertModal />
      </section>

      {/* CASE STUDIES */}
      <CaseStudies />

      {/* OTHER WORK */}
      <section className="other-work container">
        <div className="other-work__grid">
          <div className="other-work__item fade-in">
            <h4>Treasury Management System</h4>
            <p>Designed and deployed a Treasury Single Account Management System for Sierra Leone&apos;s Ministry of Finance — enhancing financial oversight and restoring stakeholder confidence.</p>
          </div>
          <div className="other-work__item fade-in">
            <h4>Cross-functional Team Leadership</h4>
            <p>Directed teams of up to 12 — PMs, designers, and engineers — across six-year product programmes with extremely low staff turnover.</p>
          </div>
          <div className="other-work__item fade-in">
            <h4>Porchplus — Proptech Advisory</h4>
            <p>Provided strategic product guidance for a property management startup: 200+ daily active users in month one and accepted into a top accelerator programme.</p>
          </div>
          <div className="other-work__item fade-in">
            <h4>Agile Process Improvement</h4>
            <p>Implemented CI/CD and agile delivery frameworks at Vatebra — reducing release turnaround times by 40% across multiple deployment environments.</p>
          </div>
          <div className="other-work__item fade-in">
            <h4>Talent &amp; Internship Programme</h4>
            <p>Established an internship pipeline at Inlaks that cultivated emerging product talent — contributing to team growth while managing costs.</p>
          </div>
          <div className="other-work__item fade-in">
            <h4>Africa Code Week — Google Grant</h4>
            <p>3&times; Google Grant Award Winner (2017–2019) as Programme Manager at Codespark Foundation, coordinating schools, government agencies, and corporate sponsors including SAP.</p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about container fade-in">
        <div className="about__copy">
          <h2>About me</h2>
          <p>I&apos;m Olabode — a product and transformation leader with 12+ years building and scaling software products across financial services, government, health, and logistics in West and Central Africa.</p>
          <p>What sets me apart is how I think about adoption, not just delivery. I&apos;ve learned that the best product in the world fails if it doesn&apos;t change how people work. So I design for behaviour change from the start — mapping customer journeys, engaging stakeholders early, and measuring outcomes beyond go-live.</p>
          <p>I hold a First Class degree in Computer Science, a Lean Six Sigma Black Belt, a Professional Scrum Master certification, and I&apos;m currently completing Product Strategy at Kellogg Executive Education. I lead with data, move with urgency, and build with people in mind.</p>
        </div>
        <div className="about__skills">
          {[
            'Product Strategy', 'Customer Journey Mapping', 'Stakeholder Management',
            'Agile / Scrum (PSM I)', 'Process Improvement', 'Lean Six Sigma Black Belt',
            'Data-Driven Decision Making', 'Cross-functional Leadership', 'OKRs & Metrics',
            'Design Thinking', 'Roadmapping', 'JIRA · Figma · Power BI',
          ].map(skill => (
            <div key={skill} className="skill-tag">{skill}</div>
          ))}
        </div>
      </section>

      <Footer />
      <ScrollEffects />
    </>
  );
}
