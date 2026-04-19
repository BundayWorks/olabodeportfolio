export interface StepNav {
  prevLabel?: string;
  prevStep?: number;
  nextLabel?: string;
  nextStep?: number;
  backToWork?: boolean;
}

export interface CalloutBlock {
  type: 'callout';
  text: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  html: string;
}

export interface InsightItem {
  strong?: string;
  text: string;
}

export interface InsightListBlock {
  type: 'insightList';
  items: InsightItem[];
}

export interface OutcomeItem {
  stat: string;
  label: string;
}

export interface OutcomeGridBlock {
  type: 'outcomeGrid';
  items: OutcomeItem[];
}

export type ContentBlock =
  | CalloutBlock
  | ParagraphBlock
  | InsightListBlock
  | OutcomeGridBlock;

export interface Step {
  number: string;
  heading: string;
  body: ContentBlock[];
  nav: StepNav;
}

export interface CaseStudyMeta {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  meta: CaseStudyMeta[];
  tabs: string[];
  steps: Step[];
}

export interface CaseStudyCard {
  slug: string;
  tag: string;
  title: string;
  description: string;
  bgColor: string;
  visualType: 'window' | 'emoji' | 'chat' | 'board' | 'icons' | 'chart';
  layout: 'left' | 'right';
}

export const CASE_STUDY_CARDS: CaseStudyCard[] = [
  {
    slug: 'taxspire',
    tag: 'Regtech · Fintech · 0→1 · Nigeria',
    title: "Building Nigeria's first consumer tax platform — ₦25M+ revenue in month one.",
    description:
      "Joined SpireCore as founding product lead to build Taxspire — Nigeria's first accessible, digital-first tax compliance platform for entrepreneurs and SMEs. In six months, with two engineers, we launched five product modules including tax profiling, business registration, invoicing, and advisory booking, generating ₦25M+ in our first month of trading.",
    bgColor: '#fce8d5',
    visualType: 'window',
    layout: 'left',
  },
  {
    slug: 'cpay',
    tag: 'Fintech · Government · West Africa',
    title: 'A payment platform that crossed borders — and changed behaviour.',
    description:
      "Led CPay from concept to live deployment across Liberia and Sierra Leone — expanding into five new government MDAs and generating over $1M in revenue. The real challenge wasn't the build; it was getting institutions to change how they moved money. I drove the adoption strategy alongside the product.",
    bgColor: '#d4edda',
    visualType: 'window',
    layout: 'right',
  },
  {
    slug: 'amis',
    tag: 'Government · SaaS · Financial Oversight',
    title: 'Turning a one-off government tool into a $2M SaaS platform.',
    description:
      'Designed an Audit Management Information System for the Sierra Leone Government — then repositioned it as a multi-tenant SaaS product. Defined the product vision, mapped the customer journey from manual audit workflows to a digitised system, and aligned a cross-functional team on a roadmap targeting $2M in recurring revenue over five years.',
    bgColor: '#e8eaf6',
    visualType: 'emoji',
    layout: 'right',
  },
  {
    slug: 'sunu',
    tag: 'Healthtech · Insurance · Africa',
    title: 'Health insurance that actually works for the people using it.',
    description:
      'Built a health insurance management suite for SUNU Health, serving operations across multiple African markets. The focus was never just the software — it was redesigning the operational experience so that customer-facing teams could serve better, faster, and with less friction. Deep stakeholder mapping drove the product requirements.',
    bgColor: '#fff8e1',
    visualType: 'chat',
    layout: 'left',
  },
  {
    slug: 'hmis',
    tag: 'HMIS · Compliance · CI/CD',
    title: 'A health information system shipped 40% faster — without cutting corners.',
    description:
      'Owned the full product lifecycle for a Health Management Information System at Vatebra — from discovery through compliance sign-off and launch. Introduced CI/CD with Jenkins, reducing release turnaround by 40%. Managed legal, clinical, and engineering stakeholders to ensure the roadmap stayed compliant and customer-centric throughout.',
    bgColor: '#e3f2fd',
    visualType: 'board',
    layout: 'right',
  },
  {
    slug: 'isendapp',
    tag: 'Logistics · 0→1 · Growth',
    title: 'iSendApp: from product concept to 1,000 users without a marketing budget.',
    description:
      'Advised iSendApp as they transformed a logistics concept into a scalable business. Shaped the MVP scope, defined the customer journey from first touch to retained user, and co-designed the GTM strategy that drove their first 1,000 users — with meaningfully improved retention from day one.',
    bgColor: '#e0f7fa',
    visualType: 'icons',
    layout: 'left',
  },
  {
    slug: 'bban',
    tag: 'Fintech · Fraud Prevention · Central Bank',
    title: "A $250K contract won by solving a problem nobody had named yet.",
    description:
      "Identified a critical gap in CPay's payment validation layer and led the design of a BBAN Validator and Account Mapper feature — securing a $250,000 contract with the Central Bank of Liberia. This came from listening to users, not just managing requirements. Deep customer journey analysis revealed the root cause behind recurring payment errors and fraud incidents.",
    bgColor: '#f3e5f5',
    visualType: 'chart',
    layout: 'right',
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'taxspire',
    tag: 'Regtech · Fintech · 0→1 · SpireCore',
    title:
      "Building Nigeria's first consumer tax platform — from a blank page to ₦25M+ revenue in month one.",
    summary:
      "Taxspire is SpireCore's flagship product: a Nigerian-first platform that automates tax compliance, business registration, and financial advisory for entrepreneurs, freelancers, and SMEs. I joined as the founding product lead — not just as a PM, but as a builder, strategist, and growth driver. In six months, with a team of two engineers, we launched multiple product modules, generated our first revenue within weeks, and built a growth engine that compounded from day one.",
    meta: [
      { label: 'Role', value: 'Head of Product & Growth (Founding)' },
      { label: 'Company', value: 'SpireCore (Taxspire) · 2025–Present' },
      { label: 'Focus Areas', value: '0→1 Product · Growth Strategy · CX Design · Regulatory Navigation' },
      { label: 'Outcome', value: '₦25M+ revenue · Month-one launch · Multiple live modules' },
    ],
    tabs: [
      '01 · Context & Entry',
      '02 · Problem Framing',
      '03 · User Journey',
      '04 · Product & Growth',
      '05 · Team & Delivery',
      '06 · Outcomes',
    ],
    steps: [
      {
        number: 'Step 01 — Context & Entry',
        heading: "I wasn't recruited to fill a role. I joined to help build a company.",
        body: [
          { type: 'paragraph', html: 'Lydia — a long-standing friend and co-founder — reached out looking for a product manager for SpireCore\'s founding product. She was building in the Nigerian regulatory-fintech space and needed someone who understood both the product craft and the Nigerian market deeply. After reviewing the opportunity, I decided to put myself forward rather than recommend someone else.' },
          { type: 'paragraph', html: 'The reason was simple: the product required more than product management. It required the energy and judgement of a founder. Someone who could help shape the idea, navigate Nigerian regulatory realities, build a team from scratch, and drive both product and revenue simultaneously. I negotiated a scope that reflected that — and I came in as more than a PM.' },
          { type: 'callout', text: 'The founding team was diaspora-led: brilliant, motivated, and deeply Nigerian in identity — but not beat-by-beat familiar with how Nigerian users, regulators, and informal markets actually behave. That gap was where I added the most immediate value.' },
          { type: 'paragraph', html: "My first contribution wasn't a product spec. It was helping the team understand the user they were building for — an average Nigerian who doesn't want to think about taxes, doesn't trust government systems, and is looking for any reason to postpone compliance." },
        ],
        nav: { nextLabel: 'Next: Problem Framing →', nextStep: 1 },
      },
      {
        number: 'Step 02 — Problem Framing',
        heading: "Nobody wakes up excited to pay taxes. That's the real product problem.",
        body: [
          { type: 'paragraph', html: 'The founding vision was "TurboTax for Nigeria" — a compelling benchmark, but one that needed significant localisation. The US model assumes users are already in the tax system, already motivated to file, and already have a relationship with financial data. Nigeria in 2025 was different on every dimension.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Policy tailwind:', text: "Nigeria's 2025 tax reforms substantially expanded the tax net — bringing millions of formally-employed Nigerians into filing obligations for the first time. The government had created the demand. Our job was to meet it." },
              { strong: 'Reluctance as the UX problem:', text: "Users didn't resist tax compliance because they opposed it in principle — they resisted because the process was opaque, bureaucratic, and historically unpleasant. The product had to make compliance feel effortless, not dutiful." },
              { strong: 'Big Four blind spot:', text: "KPMG, PwC, Deloitte and the rest dominated enterprise tax advisory. Nobody was serving entrepreneurs, freelancers, consultants, and SMEs with an accessible, affordable, digital-first option. That was our market." },
            ],
          },
          { type: 'callout', text: 'How might we make tax compliance so frictionless and useful that users think of Taxspire as a business management partner — not a tax obligation?' },
          { type: 'paragraph', html: 'This framing shifted the product strategy from "tax filing tool" to "compliance lifecycle platform" — and that shift unlocked the business model, the GTM, and ultimately the revenue architecture.' },
        ],
        nav: { prevLabel: '← Context & Entry', prevStep: 0, nextLabel: 'Next: User Journey →', nextStep: 2 },
      },
      {
        number: 'Step 03 — User Journey',
        heading: 'We mapped the full compliance life of a Nigerian — then built the platform around it.',
        body: [
          { type: 'paragraph', html: "Through stakeholder interviews, user research, and deep knowledge of Nigerian regulatory processes, I mapped a compliance journey that spanned every stage from a person's first job to owning and running a business. This became the product architecture." },
          {
            type: 'insightList',
            items: [
              { strong: 'Tax profile registration:', text: "Every compliant Nigerian needs a tax identity — registered with their state's internal revenue service. For Lagos-based users, that's LIRS. We automated this first-touch interaction, turning a traditionally manual process into a self-serve digital flow." },
              { strong: 'Business registration as a gateway:', text: 'For corporate users, you cannot legally file taxes before registering your business with the Corporate Affairs Commission. We identified this as both a prerequisite and a growth lever — business registration brought in users who would then need tax filing, advisory, and invoicing. We built it as a full-service module, not just a referral link.' },
              { strong: 'Tax filing and advisory:', text: 'Core filing for individuals and SMEs, paired with advisory from a certified tax professional I recruited specifically for this role — after an extensive search and structured interviews.' },
              { strong: 'Invoicing with compliance built in:', text: 'Invoices on Taxspire automatically incorporate TIN, withholding receipting, and VAT — turning a routine business task into a compliance touchpoint. Users manage their businesses and stay compliant at the same time.' },
              { strong: 'Tax Clearance Certificate (TCC) retrieval:', text: 'Required for visa applications, government contracts, and other obligations. We surfaced this as a user-facing feature, not buried in a settings menu.' },
            ],
          },
          { type: 'callout', text: "Each module in the platform wasn't designed independently — it was designed as a stage in a journey. The goal was that a user who came to register a business would still be on the platform two years later, filing taxes, generating invoices, and consulting our advisors." },
        ],
        nav: { prevLabel: '← Problem Framing', prevStep: 1, nextLabel: 'Next: Product & Growth →', nextStep: 3 },
      },
      {
        number: 'Step 04 — Product & Growth',
        heading: "Growth wasn't a phase after launch. It was designed into the product from day one.",
        body: [
          { type: 'paragraph', html: 'I operated simultaneously as product lead and growth lead — and I was deliberate about building those two functions together rather than sequentially. Every product decision had a growth dimension.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Prototype-first development:', text: 'Before any engineer wrote a line of code, we simulated user experiences using design tools and LLM-assisted prototyping. Prototypes went to stakeholders for review, feedback was incorporated, and only then did development begin. This dramatically shortened the gap between idea and validated product.' },
              { strong: 'Business registration as a revenue seed:', text: 'I identified that we could generate immediate revenue from business registration before the tax filing product was fully live — by leveraging my professional network and a key partnership with a certified accountant I sourced and onboarded. We used Taxspire itself as our first client and immediately generated our first registration revenue within weeks of launch.' },
              { strong: 'Closing the WhatsApp loop:', text: "Users naturally tried to interact via WhatsApp — it's the default Nigerian B2C channel. We designed a deliberate migration: after completing a service, users were directed to the platform to retrieve their certificates and documents. This forced first-party engagement and enabled product discovery at the moment of highest trust." },
              { strong: 'Google Calendar integration:', text: 'Advisory bookings were integrated directly into the product flow, tied to relevant modules. A user filing taxes could book a session mid-flow. A user registering a business got a post-registration advisory nudge. Cross-sell at every journey stage.' },
              { strong: 'Microsoft Clarity for behaviour analytics:', text: "Standard traffic analytics weren't enough. I implemented Microsoft Clarity to capture heatmaps and session recordings — understanding not just where users came from, but what they actually did: which CTAs they clicked, where they dropped off, what they scrolled past. Every week, this fed directly into product iterations." },
              { strong: 'Whole-team growth culture:', text: "I instilled the principle that growth is not the marketing team's job alone. Every team member — engineers, support, advisors — was expected to engage with the product's growth. Reposts, referrals, feedback loops. This created compounding word-of-mouth in a product category where trust is the primary conversion driver." },
              { strong: 'Email marketing and live chat:', text: 'Implemented to reduce bounce and increase conversion — live chat specifically designed to intercept intent before it left the platform.' },
            ],
          },
        ],
        nav: { prevLabel: '← User Journey', prevStep: 2, nextLabel: 'Next: Team & Delivery →', nextStep: 4 },
      },
      {
        number: 'Step 05 — Team & Delivery',
        heading: 'A full product platform. Two engineers. Six months.',
        body: [
          { type: 'paragraph', html: "One of the things I'm most proud of about this project is what we shipped with, not just what we shipped. The entire platform — tax profiling, business registration, invoicing, advisory booking, TCC retrieval — was built by a single frontend engineer and a single backend engineer, augmented by AI tooling and automation platforms I sourced and integrated into the workflow." },
          {
            type: 'insightList',
            items: [
              { strong: 'Team building from scratch:', text: 'I was involved in every hire — UI/UX designers, the product manager I later brought in, the tax advisor, and the accountant partner for business registration. I ran searches, conducted interviews, structured onboarding, and in some cases drafted the partnership agreements myself (with legal review).' },
              { strong: 'Scrum at speed:', text: "Ran structured sprint cycles with the engineering team — daily standups, weekly reviews, fortnightly roadmap sessions with management. I was running scrum on a product that didn't exist six months ago and shipping features on a weekly cadence." },
              { strong: '360-degree product involvement:', text: 'Beyond product and growth, I was advising management daily — typically two hours of strategic calls per day. On documentation, process design, compliance architecture, internal tooling, role-based access controls for the admin platform, and roadmap prioritisation for features like payroll and fintech API integrations on the horizon.' },
              { strong: 'Mentoring as a delivery multiplier:', text: 'I spent deliberate time unblocking team members — not just resolving immediate blockers, but helping each person understand the product vision deeply enough to make good decisions without me in the room. A team that understands the "why" ships better and faster.' },
            ],
          },
          { type: 'callout', text: "The engineering constraint wasn't a limitation — it was a forcing function. It made us ruthlessly prioritise, prototype before building, and automate wherever we could. The product we shipped is leaner and more focused because of it." },
        ],
        nav: { prevLabel: '← Product & Growth', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 },
      },
      {
        number: 'Step 06 — Outcomes',
        heading: '₦25M+ in month one. A platform still accelerating.',
        body: [
          {
            type: 'outcomeGrid',
            items: [
              { stat: '₦25M+', label: 'Revenue generated within the first month of launch' },
              { stat: '6 mo.', label: 'From blank page to live multi-module platform with paying customers' },
              { stat: '2 eng.', label: 'Full platform shipped by one frontend and one backend engineer' },
              { stat: '5+', label: 'Live product modules: tax profile, business registration, invoicing, advisory, TCC' },
            ],
          },
          { type: 'paragraph', html: 'The revenue result was the headline — but what it represented was more important: proof that the journey model worked. Users who came for business registration discovered tax filing. Users who filed taxes booked advisory sessions. The cross-sell loops we designed into the product were converting from week one.' },
          { type: 'paragraph', html: "The platform is actively growing. Near-term roadmap includes direct API integrations with Nigerian fintechs — enabling KYC document fulfilment as an embedded service within third-party platforms — and a payroll module that extends Taxspire further into the SME compliance lifecycle. The ambition is Stripe for African compliance infrastructure: not a tax tool, but the compliance layer that every Nigerian business runs on." },
          { type: 'callout', text: "The lesson from this project: in a market where nobody wants your product category, the route to adoption is making the journey so useful at every step that compliance becomes incidental to value. We didn't build a tax app. We built a business companion that happens to keep you compliant." },
        ],
        nav: { prevLabel: '← Team & Delivery', prevStep: 4, backToWork: true },
      },
    ],
  },
  {
    slug: 'cpay',
    tag: 'Fintech · Government · West Africa · Inlaks Limited',
    title: 'A payment platform that crossed borders — and changed behaviour.',
    summary:
      'CPay started as a single-country payment solution. I led its evolution into a cross-border government payment platform across Liberia and Sierra Leone — expanding into five new MDAs and generating over $1M in revenue. The hardest part wasn\'t the build. It was getting entrenched institutions to change how they moved public money.',
    meta: [
      { label: 'Role', value: 'Senior Product Manager' },
      { label: 'Timeline', value: '2020 – Present' },
      { label: 'Focus Areas', value: 'Product Strategy · Change Management · Adoption' },
      { label: 'Outcome', value: '$1M+ revenue · 5 new MDAs' },
    ],
    tabs: [
      '01 · Discovery',
      '02 · Problem Framing',
      '03 · Stakeholder Mapping',
      '04 · Product Design',
      '05 · Adoption Strategy',
      '06 · Outcomes',
    ],
    steps: [
      {
        number: 'Step 01 — Discovery',
        heading: 'Understanding the landscape before touching the product.',
        body: [
          { type: 'paragraph', html: 'Before scoping a single feature, I spent time embedded with the users — government finance officers, MDA cashiers, and central bank liaisons across Liberia and Sierra Leone. I conducted structured interviews, shadowed existing payment workflows, and analysed failure logs from the legacy system.' },
          { type: 'paragraph', html: "What I found wasn't a technology problem. The existing infrastructure was adequate. The real issues were trust, habit, and institutional resistance. Government staff had been managing payments manually for years. The risk wasn't that CPay wouldn't work — it was that it would work and nobody would use it." },
          { type: 'callout', text: '"The biggest discovery insight: the people who processed payments weren\'t afraid of the technology. They were afraid of accountability. Digital payments created an audit trail their manual systems didn\'t."' },
          { type: 'paragraph', html: 'I also mapped the external landscape — competing internal systems, political sensitivities between MDAs, and the compliance requirements tied to World Bank funding conditions. This informed both the product scope and the stakeholder engagement strategy.' },
        ],
        nav: { nextLabel: 'Next: Problem Framing →', nextStep: 1 },
      },
      {
        number: 'Step 02 — Problem Framing',
        heading: 'Three problems disguised as one.',
        body: [
          { type: 'paragraph', html: 'Discovery surfaced three distinct problem layers that had been treated as one. Separating them was critical to building the right product and the right change programme around it.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Workflow mismatch:', text: "CPay's original flow was designed around a bank's mental model, not a government MDA's. Payment authorisation chains in MDAs have multiple approvers, budget codes, and ministry-specific compliance steps — none of which the product accommodated." },
              { strong: 'Fragile trust:', text: 'Previous technology pilots by other vendors had failed visibly. Staff were sceptical and senior officials were politically exposed if another rollout failed publicly.' },
              { strong: 'No adoption plan:', text: 'The product had been sold to procurement. No one had a plan for getting the actual users — 200+ front-line finance officers — to change their daily behaviour.' },
            ],
          },
          { type: 'callout', text: 'How might we design a payment platform that government staff choose to use — not because they\'re told to, but because it makes their job easier and their work more defensible?' },
        ],
        nav: { prevLabel: '← Discovery', prevStep: 0, nextLabel: 'Next: Stakeholder Mapping →', nextStep: 2 },
      },
      {
        number: 'Step 03 — Stakeholder Mapping',
        heading: 'Knowing who to move, and in what order.',
        body: [
          { type: 'paragraph', html: 'I built a full stakeholder map across three tiers — executive sponsors, operational gatekeepers, and end users. Each group had different motivations, different risk tolerances, and different definitions of success.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Ministry Finance Directors:', text: 'Cared about audit compliance and reduced reconciliation time. Needed proof of concept before committing their teams.' },
              { strong: 'MDA Cashiers & Payment Officers:', text: 'Cared about not being blamed if a transaction failed. Needed a system that was forgiving, transparent, and gave them a clear paper trail.' },
              { strong: 'Central Bank Liaisons:', text: 'Cared about interoperability and CBL compliance. Needed technical confidence in the validation layer.' },
              { strong: 'Inlaks Leadership:', text: 'Cared about revenue, market expansion, and reputational risk from any public failure.' },
            ],
          },
          { type: 'paragraph', html: 'I used this map to sequence the rollout — starting with the MDA that had the most progressive Finance Director as a visible early win, then using that success story to bring resistant MDAs onboard. Sequencing the adoption deliberately, rather than launching to everyone at once, was one of the most important decisions of the project.' },
        ],
        nav: { prevLabel: '← Problem Framing', prevStep: 1, nextLabel: 'Next: Product Design →', nextStep: 3 },
      },
      {
        number: 'Step 04 — Product Design',
        heading: 'Rebuilding the flow around how government actually works.',
        body: [
          { type: 'paragraph', html: "Armed with the research, I led a redesign of CPay's core payment authorisation flow. The key changes were driven entirely by user insight, not technical preference." },
          {
            type: 'insightList',
            items: [
              { text: 'Introduced configurable multi-level approval chains, allowing each MDA to map their existing authorisation hierarchy into the system — no change to their governance structure required.' },
              { text: 'Added real-time payment status visibility for all approvers in the chain, eliminating the "where is this transaction?" question that generated most support calls.' },
              { text: 'Built audit-ready export functions so finance officers could produce reconciliation reports in their existing formats — reducing the perceived disruption to month-end processes.' },
              { text: 'Simplified the error messaging language — replacing technical codes with plain-language descriptions and suggested remediation steps written for non-technical users.' },
            ],
          },
          { type: 'paragraph', html: "I ran two rounds of usability testing with actual MDA finance staff before finalising the design, iterating on the approval flow after observing where users paused or backtracked. The product decisions weren't about elegance — they were about reducing the cost of adoption for the user." },
        ],
        nav: { prevLabel: '← Stakeholder Mapping', prevStep: 2, nextLabel: 'Next: Adoption Strategy →', nextStep: 4 },
      },
      {
        number: 'Step 05 — Adoption Strategy',
        heading: 'Deployment is day one. Adoption is the actual goal.',
        body: [
          { type: 'paragraph', html: 'I designed a structured adoption programme running in parallel with the technical deployment. It was built around three principles: show before tell, celebrate early wins publicly, and make it easy to ask for help without embarrassment.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Super-user programme:', text: 'Identified one enthusiastic early adopter per MDA and trained them intensively before wider rollout. They became the internal help desk and the proof point for their colleagues.' },
              { strong: 'Guided onboarding sessions:', text: 'Rather than training manuals, I ran live walkthroughs of the exact transaction types each team processed daily — no hypothetical scenarios.' },
              { strong: '30-day check-in cadence:', text: 'Scheduled structured feedback calls at week 1, week 2, and day 30 post-launch to surface friction before it became resistance.' },
              { strong: 'Usage dashboards for leadership:', text: 'Provided Ministry Directors a simple weekly report on adoption rates by team — turning visibility into internal accountability without top-down mandates.' },
            ],
          },
          { type: 'callout', text: 'The super-user model proved to be the highest-leverage investment. Peer-to-peer credibility moved faster than any official communication could.' },
        ],
        nav: { prevLabel: '← Product Design', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 },
      },
      {
        number: 'Step 06 — Outcomes',
        heading: 'What changed, and what it proved.',
        body: [
          {
            type: 'outcomeGrid',
            items: [
              { stat: '$1M+', label: 'Revenue generated through CPay adoption' },
              { stat: '5', label: 'New MDAs onboarded beyond original scope' },
              { stat: '2', label: 'Countries: Liberia and Sierra Leone' },
              { stat: '0', label: 'Major post-launch rollbacks or compliance incidents' },
            ],
          },
          { type: 'paragraph', html: "The expansion into five additional MDAs wasn't part of the original contract — it was earned. When the first MDA's Finance Director publicly credited CPay with improving their audit readiness at a Ministry-wide review meeting, three other MDAs requested onboarding within a month." },
          { type: 'paragraph', html: "The lesson this project reinforced: product success in institutional contexts is measured by sustained use, not deployment date. Building the adoption programme into the product strategy — not as an afterthought — was what made the difference." },
          { type: 'callout', text: "What I'd do differently: instrument adoption metrics from day one. We tracked revenue and transactions, but tracking per-user engagement earlier would have let us intervene faster with lagging MDAs." },
        ],
        nav: { prevLabel: '← Adoption Strategy', prevStep: 4, backToWork: true },
      },
    ],
  },
  {
    slug: 'amis',
    tag: 'Government · SaaS · Financial Oversight · Inlaks Limited',
    title: 'Turning a one-off government tool into a $2M SaaS platform.',
    summary:
      "What began as a custom Audit Management Information System for the Sierra Leone Government became the blueprint for a multi-tenant SaaS product. I led the pivot — defining the vision, mapping the customer journey from fragmented manual audit workflows to a digitised platform, and building the roadmap to $2M in recurring revenue over five years.",
    meta: [
      { label: 'Role', value: 'Senior Product Manager' },
      { label: 'Client', value: 'Sierra Leone Government' },
      { label: 'Focus Areas', value: 'Product Strategy · SaaS Pivot · CX Design' },
      { label: 'Target', value: '$2M recurring revenue (5-year roadmap)' },
    ],
    tabs: [
      '01 · Discovery',
      '02 · Problem Framing',
      '03 · Journey Mapping',
      '04 · SaaS Pivot',
      '05 · Roadmap',
      '06 · Outcomes',
    ],
    steps: [
      {
        number: 'Step 01 — Discovery',
        heading: 'Auditors were drowning in paper — and nobody had mapped the whole process.',
        body: [
          { type: 'paragraph', html: 'The Sierra Leone Audit Service was managing a national audit function across dozens of ministries using a combination of spreadsheets, paper files, and email chains. Finding, tracking, and resolving audit findings could take months — not because the auditors weren\'t capable, but because the process architecture was broken.' },
          { type: 'paragraph', html: 'I conducted discovery sessions with Audit Officers, Senior Auditors, and the Auditor General\'s office. I also reviewed historical audit reports to understand the volume, nature, and resolution patterns of findings. I mapped every handoff in the process — from finding identification to final sign-off — and counted the manual steps.' },
          { type: 'callout', text: 'The average time from audit finding to documented resolution was 14 weeks. Most of that time was lost not in the actual work, but in chasing confirmations, locating files, and managing email threads across ministries.' },
          { type: 'paragraph', html: 'The discovery also revealed something commercially important: the same workflow problems existed in every African government audit office I researched. This was not a Sierra Leone problem. It was a sector-wide problem with no modern solution.' },
        ],
        nav: { nextLabel: 'Next: Problem Framing →', nextStep: 1 },
      },
      {
        number: 'Step 02 — Problem Framing',
        heading: 'A custom build would solve one client\'s pain. A platform could solve a continent\'s.',
        body: [
          { type: 'paragraph', html: 'The original brief was to build a custom system for Sierra Leone. I challenged that framing with data from the discovery phase, presenting a business case to Inlaks leadership for a platform architecture that could be configured per government client — rather than rebuilt from scratch each time.' },
          {
            type: 'insightList',
            items: [
              { text: 'The core audit workflow (plan → fieldwork → findings → response → resolution → reporting) was structurally identical across all public sector audit bodies I reviewed.' },
              { text: 'Each country had its own compliance terminology and report formats — but these were configuration problems, not architecture problems.' },
              { text: 'A SaaS model would create recurring revenue versus one-time project fees, changing the commercial profile of the product entirely.' },
            ],
          },
          { type: 'callout', text: 'How might we build an audit management system so configurable that deploying it for a new government client takes weeks, not months — and every new client makes the platform stronger?' },
        ],
        nav: { prevLabel: '← Discovery', prevStep: 0, nextLabel: 'Next: Journey Mapping →', nextStep: 2 },
      },
      {
        number: 'Step 03 — Journey Mapping',
        heading: 'Mapping the full audit lifecycle — from planning to accountability.',
        body: [
          { type: 'paragraph', html: 'I created end-to-end journey maps for four distinct user roles: the Audit Officer, the Senior Auditor, the Ministry Respondent, and the Auditor General. Each had a different touchpoint set, different pain profile, and different definition of success.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Audit Officers', text: 'needed fast finding capture in the field — including offline capability, since many audit locations had unreliable internet.' },
              { strong: 'Senior Auditors', text: 'needed a consolidated view of all open findings across their portfolio, with status and age visible at a glance.' },
              { strong: 'Ministry Respondents', text: 'needed a simple interface to review, respond to, and escalate findings — without needing audit expertise to navigate the system.' },
              { strong: 'The Auditor General', text: 'needed executive dashboards: resolution rates, outstanding risk items, time-to-close by ministry, and report generation with one click.' },
            ],
          },
          { type: 'paragraph', html: "The journey maps revealed that the most painful friction wasn't in the auditors' workflow — it was in the Ministry Respondent experience. They were the bottleneck. Simplifying their interface and introducing email-based response notifications (without requiring them to log in) cut the average response time significantly in early testing." },
        ],
        nav: { prevLabel: '← Problem Framing', prevStep: 1, nextLabel: 'Next: SaaS Pivot →', nextStep: 3 },
      },
      {
        number: 'Step 04 — SaaS Pivot',
        heading: 'Designing for the second client before the first one was live.',
        body: [
          { type: 'paragraph', html: 'I worked with the engineering team to define the multi-tenancy architecture requirements from the ground up — separating tenant-specific configuration from the core platform logic. This required difficult conversations about short-term scope versus long-term scalability.' },
          { type: 'paragraph', html: 'Key product decisions that enabled the SaaS pivot:' },
          {
            type: 'insightList',
            items: [
              { text: 'All audit terminology, report templates, and workflow stage names stored as configurable metadata — not hardcoded strings.' },
              { text: 'Country-specific compliance rules implemented as configurable rule sets, not embedded logic.' },
              { text: 'A modular permission model that allowed each government client to define their own approval hierarchy without engineering involvement.' },
              { text: "A white-label layer so each deployment could carry the client government's branding — critical for institutional trust and adoption." },
            ],
          },
          { type: 'paragraph', html: "I presented the SaaS architecture decision to Inlaks leadership with a 5-year financial model showing the delta between per-project billing and SaaS recurring revenue. The platform approach was approved, and we built accordingly from day one." },
        ],
        nav: { prevLabel: '← Journey Mapping', prevStep: 2, nextLabel: 'Next: Roadmap →', nextStep: 4 },
      },
      {
        number: 'Step 05 — Roadmap',
        heading: 'A 5-year roadmap built backwards from the revenue target.',
        body: [
          { type: 'paragraph', html: 'With the platform architecture confirmed, I built the product roadmap in three phases designed around the $2M recurring revenue target.' },
          {
            type: 'insightList',
            items: [
              { strong: 'Phase 1 — Core Deployment (Year 1):', text: 'Sierra Leone Audit Service live. Full audit lifecycle management, offline field capture, and executive reporting dashboard. Establish reference client credentials and case study.' },
              { strong: 'Phase 2 — Platform Expansion (Year 2–3):', text: 'Two additional West African government audit bodies onboarded. Introduce API integrations with existing government financial management systems. Refine configuration tooling based on real onboarding experience.' },
              { strong: 'Phase 3 — Scale (Year 4–5):', text: 'Self-service configuration portal allowing new government clients to onboard without Inlaks professional services. Introduce analytics module with cross-country benchmarking. Target 8 active government clients for $2M ARR.' },
            ],
          },
          { type: 'callout', text: "The roadmap was written as a strategic narrative, not just a feature list — each phase had a hypothesis about market behaviour and a clear success metric. This made it a living planning document, not a contract." },
        ],
        nav: { prevLabel: '← SaaS Pivot', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 },
      },
      {
        number: 'Step 06 — Outcomes',
        heading: 'From a one-client project to a platform with a commercial future.',
        body: [
          {
            type: 'outcomeGrid',
            items: [
              { stat: '$2M', label: 'Targeted recurring revenue over 5-year roadmap' },
              { stat: '1→N', label: 'Architecture designed for multi-government deployment' },
              { stat: '14wk', label: 'Average finding-to-resolution time targeted for reduction' },
              { stat: '4', label: 'Distinct user roles mapped with full journey blueprints' },
            ],
          },
          { type: 'paragraph', html: "The Sierra Leone deployment gave Inlaks a referenceable government client in a market with no comparable solution. The platform architecture means every subsequent deployment is faster and more profitable. The five-year roadmap is a live document — updated quarterly as new market intelligence comes in." },
          { type: 'paragraph', html: "The deeper outcome: this project proved that a product mindset applied to government technology — specifically, the discipline of mapping user journeys before writing requirements — can turn a consultancy engagement into a scalable software business." },
        ],
        nav: { prevLabel: '← Roadmap', prevStep: 4, backToWork: true },
      },
    ],
  },
  {
    slug: 'sunu',
    tag: 'Healthtech · Insurance · Africa · SUNU Health',
    title: 'Health insurance that actually works for the people using it.',
    summary: 'Built a health insurance management suite for SUNU Health, serving operations across multiple African markets. The focus was never just the software — it was redesigning the operational experience so that customer-facing teams could serve better, faster, and with less friction.',
    meta: [
      { label: 'Role', value: 'Senior Product Manager' },
      { label: 'Company', value: 'SUNU Health' },
      { label: 'Focus Areas', value: 'CX Design · Stakeholder Mapping · Ops Redesign' },
      { label: 'Scope', value: 'Multi-country Africa deployment' },
    ],
    tabs: ['01 · Discovery', '02 · Problem Framing', '03 · Stakeholder Mapping', '04 · Product Design', '05 · Delivery', '06 · Outcomes'],
    steps: [
      { number: 'Step 01 — Discovery', heading: 'Insurance operations running on memory and manual workarounds.', body: [{ type: 'paragraph', html: 'SUNU Health\'s customer-facing teams were managing claims, enrolments, and policy queries across several African markets with fragmented tooling — a mix of spreadsheets, legacy systems, and undocumented manual steps. Customers experienced delays and inconsistencies that had nothing to do with insurance coverage and everything to do with operational design.' }, { type: 'callout', text: 'The root issue wasn\'t the people or the processes individually — it was that the tools didn\'t reflect how the work actually happened. Staff were compensating for system gaps every day.' }], nav: { nextLabel: 'Next: Problem Framing →', nextStep: 1 } },
      { number: 'Step 02 — Problem Framing', heading: 'The product gap was an operations gap in disguise.', body: [{ type: 'paragraph', html: 'The brief was to build a claims management system. Discovery revealed that was too narrow — claims were slow because enrolment data was incomplete, enrolment was incomplete because the onboarding flow was broken, and the onboarding flow was broken because it had been designed by engineers without ops input.' }, { type: 'callout', text: 'How might we design a system that reflects how SUNU\'s operational teams actually work — so they can serve customers faster, with less back-and-forth, and without needing to compensate for software gaps?' }], nav: { prevLabel: '← Discovery', prevStep: 0, nextLabel: 'Next: Stakeholder Mapping →', nextStep: 2 } },
      { number: 'Step 03 — Stakeholder Mapping', heading: 'Seven user types. One system. Competing priorities.', body: [{ type: 'paragraph', html: 'I mapped seven distinct user types across the SUNU operations: customer-facing agents, claims assessors, medical network liaisons, compliance officers, country managers, central operations, and the executive team. Each had a different use of the system and a different pain point.' }, { type: 'callout', text: 'The most valuable insight from the stakeholder work: the people who validated claims were not the same people who entered claim data — but they were using the same screens. Separating those workflows was the highest-impact design decision.' }], nav: { prevLabel: '← Problem Framing', prevStep: 1, nextLabel: 'Next: Product Design →', nextStep: 3 } },
      { number: 'Step 04 — Product Design', heading: 'Designed around the work, not around the data model.', body: [{ type: 'paragraph', html: 'I led the design of the core insurance management modules: enrolment, claims intake, claims assessment, provider network management, and reporting. Every screen was tested with the actual operational staff who would use it — not their managers.' }, { type: 'insightList', items: [{ text: 'Enrolment redesigned to capture complete policyholder data upfront, with validation logic preventing incomplete submissions that caused downstream claims delays.' }, { text: 'Claims intake built with guided step-by-step flows rather than a single complex form — reducing input errors and training time for new staff.' }, { text: 'Claims assessment dashboard giving assessors a prioritised queue with all required information visible on a single screen — no tab-switching, no file lookup.' }] }], nav: { prevLabel: '← Stakeholder Mapping', prevStep: 2, nextLabel: 'Next: Delivery →', nextStep: 4 } },
      { number: 'Step 05 — Delivery', heading: 'Cross-country rollout with zero downtime on live operations.', body: [{ type: 'paragraph', html: 'SUNU Health could not pause operations for a system migration. The rollout was designed as a parallel-run phased transition — new system live alongside legacy, with data migrated progressively, and staff trained in cohorts to avoid operational gaps.' }, { type: 'callout', text: 'The phased approach meant feedback from the first country shaped the configuration for every subsequent deployment. The system improved with each rollout.' }], nav: { prevLabel: '← Product Design', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 } },
      { number: 'Step 06 — Outcomes', heading: 'Faster operations. Better customer experience. A platform that scales.', body: [{ type: 'outcomeGrid', items: [{ stat: '7', label: 'User roles mapped and served by a single unified system' }, { stat: 'Multi', label: 'African markets deployed without operational downtime' }, { stat: '↓', label: 'Claims processing time reduced through workflow redesign' }, { stat: '0', label: 'Rollback events across any country deployment' }] }, { type: 'paragraph', html: "The deeper outcome of this project was cultural as much as technical. SUNU's operations teams became advocates for the system because it had been built around their real work. Adoption didn't need to be mandated — the product was visibly better than the alternative." }], nav: { prevLabel: '← Delivery', prevStep: 4, backToWork: true } },
    ],
  },
  {
    slug: 'hmis',
    tag: 'HMIS · Compliance · CI/CD · Vatebra',
    title: 'A health information system shipped 40% faster — without cutting corners.',
    summary: 'Owned the full product lifecycle for a Health Management Information System at Vatebra — from discovery through compliance sign-off and launch. Introduced CI/CD with Jenkins, reducing release turnaround by 40%.',
    meta: [
      { label: 'Role', value: 'Product Manager' },
      { label: 'Company', value: 'Vatebra' },
      { label: 'Focus Areas', value: 'Compliance · CI/CD · Cross-functional Delivery' },
      { label: 'Outcome', value: '40% faster release turnaround' },
    ],
    tabs: ['01 · Discovery', '02 · Compliance Mapping', '03 · Engineering Process', '04 · Stakeholder Alignment', '05 · Launch', '06 · Outcomes'],
    steps: [
      { number: 'Step 01 — Discovery', heading: 'A health system where release cycles were the biggest clinical risk.', body: [{ type: 'paragraph', html: 'The HMIS at Vatebra was a critical system — used for patient data management and clinical reporting across healthcare facilities. The core product was solid. The problem was delivery: releases took weeks, bugs accumulated between cycles, and compliance sign-offs were a manual bottleneck that no one had formally addressed.' }, { type: 'callout', text: 'The longest release cycle I inherited was 11 weeks. Every week of delay was a week of accumulated risk in a clinical context.' }], nav: { nextLabel: 'Next: Compliance Mapping →', nextStep: 1 } },
      { number: 'Step 02 — Compliance Mapping', heading: 'Compliance wasn\'t a blocker. It was an input we hadn\'t designed for.', body: [{ type: 'paragraph', html: 'The compliance bottleneck existed because legal and clinical sign-off had been placed at the end of the release process — after development, after QA, as a final gate. I reframed compliance as a design input: requirements that shaped how features were built, not a checklist at the end.' }, { type: 'insightList', items: [{ text: 'Mapped all applicable data protection, clinical accuracy, and audit requirements at the start of each sprint, not the end.' }, { text: 'Created a compliance checklist embedded into the feature definition template — so every story had compliance acceptance criteria alongside functional ones.' }, { text: 'Introduced a monthly compliance review with the legal team to address accumulated queries rather than ad hoc firefighting.' }] }], nav: { prevLabel: '← Discovery', prevStep: 0, nextLabel: 'Next: Engineering Process →', nextStep: 2 } },
      { number: 'Step 03 — Engineering Process', heading: 'Introducing CI/CD in an environment that had never used it.', body: [{ type: 'paragraph', html: 'The engineering team at Vatebra had never deployed CI/CD tooling. Releases were manual, environment parity was poor, and test coverage was inconsistent. I led the introduction of Jenkins for continuous integration, working alongside the engineering lead to define the pipeline architecture.' }, { type: 'insightList', items: [{ strong: 'Automated test runs on every PR:', text: 'Caught regressions within minutes rather than discovering them in staging two weeks later.' }, { strong: 'Parallel environment deployment:', text: 'Dev, staging, and production environments kept in parity — eliminating the "works on my machine" class of release failures.' }, { strong: 'Release gates:', text: 'Automated compliance checklist validation before any staging deployment, making compliance a code-level check rather than a human one.' }] }, { type: 'callout', text: 'The CI/CD implementation didn\'t just speed up releases — it changed the engineering team\'s relationship with quality. Bugs caught early stopped being someone\'s fault and started being the system\'s job.' }], nav: { prevLabel: '← Compliance Mapping', prevStep: 1, nextLabel: 'Next: Stakeholder Alignment →', nextStep: 3 } },
      { number: 'Step 04 — Stakeholder Alignment', heading: 'Clinical, legal, and engineering — three teams with three definitions of "done".', body: [{ type: 'paragraph', html: 'The three stakeholder groups — clinical advisors, legal compliance, and engineering — had never operated from a shared definition of a successful release. I established a monthly cross-functional review that brought all three groups around a single roadmap, with shared release criteria.' }, { type: 'callout', text: 'The most important outcome of the cross-functional reviews wasn\'t the decisions made — it was the shared language that developed. Clinical staff started understanding why engineering needed lead time. Engineers started understanding what "compliant" actually meant in practice.' }], nav: { prevLabel: '← Engineering Process', prevStep: 2, nextLabel: 'Next: Launch →', nextStep: 4 } },
      { number: 'Step 05 — Launch', heading: 'Shipped on schedule. Zero compliance incidents.', body: [{ type: 'paragraph', html: 'The HMIS launched on schedule — with full clinical compliance sign-off, no rollback required, and a post-launch support ticket volume 60% lower than the previous major release. The CI/CD pipeline continued running, with releases moving from quarterly to monthly within six months of the initial launch.' }], nav: { prevLabel: '← Stakeholder Alignment', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 } },
      { number: 'Step 06 — Outcomes', heading: '40% faster. Fully compliant. A model the team repeated.', body: [{ type: 'outcomeGrid', items: [{ stat: '40%', label: 'Reduction in release turnaround time after CI/CD implementation' }, { stat: '0', label: 'Compliance incidents at launch or post-launch' }, { stat: '11wk→', label: 'Release cycle compressed to under 7 weeks, then monthly' }, { stat: '3', label: 'Stakeholder groups aligned on shared release criteria' }] }, { type: 'paragraph', html: "The deeper lesson: delivery speed and compliance aren't in tension — they're in tension when compliance is treated as a gate. When it's treated as a design input, it accelerates delivery by eliminating late-stage surprises." }], nav: { prevLabel: '← Launch', prevStep: 4, backToWork: true } },
    ],
  },
  {
    slug: 'isendapp',
    tag: 'Logistics · 0→1 · Growth',
    title: 'iSendApp: from product concept to 1,000 users without a marketing budget.',
    summary: 'Advised iSendApp as they transformed a logistics concept into a scalable business. Shaped the MVP scope, defined the customer journey from first touch to retained user, and co-designed the GTM strategy that drove their first 1,000 users.',
    meta: [
      { label: 'Role', value: 'Product Advisor' },
      { label: 'Company', value: 'iSendApp' },
      { label: 'Focus Areas', value: 'MVP Scoping · GTM Strategy · Growth' },
      { label: 'Outcome', value: '1,000 users · Improved day-1 retention' },
    ],
    tabs: ['01 · Context', '02 · MVP Scope', '03 · Customer Journey', '04 · GTM Strategy', '05 · Growth', '06 · Outcomes'],
    steps: [
      { number: 'Step 01 — Context', heading: 'A logistics idea with no product definition and no budget.', body: [{ type: 'paragraph', html: 'iSendApp came to me with a concept: a platform to simplify package sending and logistics management for small businesses and individuals in Nigeria. The idea was sound. But the founding team had no product background, a limited budget, and an instinct to build everything at once.' }, { type: 'callout', text: 'The most important early work wasn\'t building anything. It was deciding what not to build.' }], nav: { nextLabel: 'Next: MVP Scope →', nextStep: 1 } },
      { number: 'Step 02 — MVP Scope', heading: 'One job. One user type. Ship it.', body: [{ type: 'paragraph', html: 'I facilitated a scope-down exercise with the founding team, cutting the initial feature list from 34 items to 8. The MVP would do exactly one thing well: allow a sender to book a courier pickup, track the delivery, and confirm receipt — entirely through the app.' }, { type: 'insightList', items: [{ text: 'Removed B2B fleet management features (too complex, different user type) from the MVP.' }, { text: 'Removed payment splitting, multi-address books, and scheduled recurring deliveries — all deferred to v2.' }, { text: 'Kept the tracking feature even though it required third-party integration, because it was the number-one reason early users said they would trust a new logistics platform.' }] }], nav: { prevLabel: '← Context', prevStep: 0, nextLabel: 'Next: Customer Journey →', nextStep: 2 } },
      { number: 'Step 03 — Customer Journey', heading: 'Mapped from first impression to the third delivery.', body: [{ type: 'paragraph', html: 'I built a customer journey map covering five stages: awareness, first booking, first delivery completion, second booking (the retention signal), and referral. Each stage had a drop-off hypothesis and a specific intervention designed into the product.' }, { type: 'callout', text: 'The insight that shaped the most product decisions: users who completed their first delivery and saw real-time tracking were 3× more likely to book again within 7 days. Everything in the MVP was optimised around that first tracking experience.' }], nav: { prevLabel: '← MVP Scope', prevStep: 1, nextLabel: 'Next: GTM Strategy →', nextStep: 3 } },
      { number: 'Step 04 — GTM Strategy', heading: 'No budget. So we made the product the distribution channel.', body: [{ type: 'paragraph', html: 'With no marketing budget, the GTM strategy had to be product-led. I co-designed a referral mechanic built into the delivery confirmation flow — senders could share a branded delivery link that recipients could use to send their own packages, with a first-delivery discount.' }, { type: 'insightList', items: [{ strong: 'Community seeding:', text: 'First 50 users were recruited from Lagos small business WhatsApp groups, given white-glove onboarding, and asked for feedback directly.' }, { strong: 'Courier as evangelist:', text: 'Courier partners were trained to explain the app to senders at the point of pickup — making every delivery a sales touchpoint.' }, { strong: 'B2B micro-targeting:', text: 'Identified 10 small e-commerce businesses and offered them preferential rates for using iSendApp exclusively for 30 days. Their volume and social proof seeded the platform.' }] }], nav: { prevLabel: '← Customer Journey', prevStep: 2, nextLabel: 'Next: Growth →', nextStep: 4 } },
      { number: 'Step 05 — Growth', heading: 'Compounding from the first 100 to the first 1,000.', body: [{ type: 'paragraph', html: 'Growth from 100 to 1,000 users came from three sources: organic referrals (the delivery link mechanic), word of mouth from the 10 B2B seed partners, and an Instagram-led awareness push that cost under ₦50,000 and drove 300+ signups in two weeks.' }, { type: 'callout', text: 'The most valuable growth insight: the B2B seed partners drove 4× more signups per partner than any paid channel. Their endorsement carried social proof that ads couldn\'t buy.' }], nav: { prevLabel: '← GTM Strategy', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 } },
      { number: 'Step 06 — Outcomes', heading: '1,000 users. Better retention. A model that compounded.', body: [{ type: 'outcomeGrid', items: [{ stat: '1,000', label: 'Users reached without a paid marketing budget' }, { stat: '3×', label: 'Repeat booking rate for users who experienced real-time tracking' }, { stat: '8', label: 'MVP features shipped (down from 34 in the original scope)' }, { stat: '₦50K', label: 'Total paid marketing spend for the first 1,000 users' }] }, { type: 'paragraph', html: "The lesson iSendApp demonstrated: in consumer logistics, trust is the product. Every feature decision, every GTM tactic, and every growth mechanic was ultimately about making the sender trust that their package would arrive — and that iSendApp was the most reliable way to make that happen." }], nav: { prevLabel: '← Growth', prevStep: 4, backToWork: true } },
    ],
  },
  {
    slug: 'bban',
    tag: 'Fintech · Fraud Prevention · Central Bank · Inlaks Limited',
    title: "A $250K contract won by solving a problem nobody had named yet.",
    summary: "Identified a critical gap in CPay's payment validation layer and led the design of a BBAN Validator and Account Mapper feature — securing a $250,000 contract with the Central Bank of Liberia.",
    meta: [
      { label: 'Role', value: 'Senior Product Manager' },
      { label: 'Client', value: 'Central Bank of Liberia' },
      { label: 'Focus Areas', value: 'Fraud Prevention · Payment Validation · Contract Win' },
      { label: 'Outcome', value: '$250K contract secured' },
    ],
    tabs: ['01 · Discovery', '02 · Problem Framing', '03 · Solution Design', '04 · Validation', '05 · Contract', '06 · Outcomes'],
    steps: [
      { number: 'Step 01 — Discovery', heading: 'Recurring payment failures that nobody had traced to their root cause.', body: [{ type: 'paragraph', html: "CPay was processing government payments across Liberia when a pattern emerged in the support data: a disproportionate number of failed or misdirected payments were linked to account number entry. Staff were manually entering Basic Bank Account Numbers (BBANs), and the system had no validation layer to catch errors before processing." }, { type: 'callout', text: "The support tickets described the symptom — payment failed, payment went to wrong account — but nobody had traced the root cause. I pulled three months of failure logs and found that 68% of payment errors were attributable to BBAN entry mistakes." }], nav: { nextLabel: 'Next: Problem Framing →', nextStep: 1 } },
      { number: 'Step 02 — Problem Framing', heading: 'Not a user error problem. A missing validation layer.', body: [{ type: 'paragraph', html: "The instinct in the team was to frame this as a training problem — staff needed to be more careful when entering account numbers. I challenged that framing. In a high-volume payment environment, human error rates don't improve through training; they improve through system design." }, { type: 'callout', text: "How might we make it structurally impossible to submit a payment to an invalid or unresolvable account — without adding friction to the payment flow for valid transactions?" }], nav: { prevLabel: '← Discovery', prevStep: 0, nextLabel: 'Next: Solution Design →', nextStep: 2 } },
      { number: 'Step 03 — Solution Design', heading: 'A validation layer that mapped BBANs to verified account identities.', body: [{ type: 'paragraph', html: "I designed a BBAN Validator and Account Mapper feature that sat between entry and submission in the payment flow. When a user entered an account number, the system would validate the BBAN format against the Central Bank's account structure rules, then resolve it to a verified account holder name for human confirmation before submission." }, { type: 'insightList', items: [{ strong: 'Real-time BBAN format validation:', text: 'Checked structure and check digits against CBL account number rules, flagging malformed entries instantly.' }, { strong: 'Account name resolution:', text: 'Resolved valid BBANs to verified account holder names via CBL API integration — allowing payment officers to visually confirm the recipient before submission.' }, { strong: 'Audit trail generation:', text: 'Every validation event logged with timestamp, operator ID, and resolution result — creating a full fraud-audit trail for compliance purposes.' }] }], nav: { prevLabel: '← Problem Framing', prevStep: 1, nextLabel: 'Next: Validation →', nextStep: 3 } },
      { number: 'Step 04 — Validation', heading: 'Tested against real failure data before a line of code was written.', body: [{ type: 'paragraph', html: "Before engineering began, I ran the proposed validation logic against the three months of historical failure data. 94% of the previously-failed transactions would have been caught and corrected by the validator before submission." }, { type: 'callout', text: "The validation test also revealed something unexpected: 12% of the 'failed payment' logs were not user errors — they were attempted fraud. The account name resolution step would have caught these too, because the resolved name didn't match what the submitter claimed." }], nav: { prevLabel: '← Solution Design', prevStep: 2, nextLabel: 'Next: Contract →', nextStep: 4 } },
      { number: 'Step 05 — Contract', heading: "A $250K contract the Central Bank initiated — we didn't pitch it.", body: [{ type: 'paragraph', html: "I presented the BBAN validator findings and design to the CPay programme team. The product director shared the analysis with Central Bank of Liberia stakeholders during a quarterly review. Within three weeks, the CBL had initiated a $250,000 contract to implement the feature as a mandatory validation layer across all government payment flows." }, { type: 'callout', text: "The contract came because we had quantified the problem before proposing the solution. The CBL's response wasn't 'interesting idea' — it was 'we've been looking for someone to solve this for two years.'" }], nav: { prevLabel: '← Validation', prevStep: 3, nextLabel: 'See Outcomes →', nextStep: 5 } },
      { number: 'Step 06 — Outcomes', heading: '$250K. Zero misdirected payments. A fraud prevention capability.', body: [{ type: 'outcomeGrid', items: [{ stat: '$250K', label: 'Contract value secured with Central Bank of Liberia' }, { stat: '94%', label: 'Of historical failed payments would have been caught by validator' }, { stat: '68%', label: 'Of payment errors attributable to BBAN entry — the root cause nobody had named' }, { stat: '12%', label: 'Of failure logs identified as attempted fraud, not user error' }] }, { type: 'paragraph', html: "The lesson this project crystallised: the most valuable product work is often identifying the problem nobody has named yet. The BBAN validator wasn't on any roadmap. It wasn't requested by any stakeholder. It came from reading support data until a pattern became undeniable — and then quantifying it before anyone asked." }], nav: { prevLabel: '← Contract', prevStep: 4, backToWork: true } },
    ],
  },
];
