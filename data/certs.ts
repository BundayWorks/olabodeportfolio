export interface CertImage {
  src: string;
  label: string;
  url?: string;
}

export interface Cert {
  title: string;
  images: CertImage[];
  pending?: boolean;
  noClick?: boolean;
}

export const CERTS: Record<string, Cert> = {
  psm: {
    title: 'PSM I — Professional Scrum Master',
    images: [
      {
        src: '/assets/Professional Scrum Master I.png',
        label: 'Professional Scrum Master I',
        url: 'https://www.credly.com/badges/48fb5ca3-d969-4cb3-8cb1-a931b32ab6b0',
      },
    ],
  },
  lss: {
    title: 'Lean Six Sigma Black Belt',
    images: [
      {
        src: '/assets/Lean Six Sigma Certification.png',
        label: 'Lean Six Sigma Black Belt',
        url: 'https://www.credly.com/badges/cdb65722-1747-4666-a0f0-366bf7df777b',
      },
    ],
  },
  ux: {
    title: 'UX Design — Accenture',
    images: [
      {
        src: '/assets/UX Design Accenture Certification.png',
        label: 'UX Design Certificate',
        url: 'https://www.futurelearn.com/certificates/c37i3lv',
      },
    ],
  },
  ibm: {
    title: 'Enterprise Design Thinking — IBM',
    images: [
      {
        src: '/assets/Enterprise Design Thinking Practitioner.png',
        label: 'Enterprise Design Thinking Practitioner',
        url: 'https://www.credly.com/badges/db1c2e29-4bf1-46cf-9a82-5e6c062da69b',
      },
    ],
  },
  fmva: {
    title: 'FMVA — Corporate Finance Institute (in progress)',
    pending: true,
    images: [
      {
        src: '/assets/CFI - Accounting Fundamentals.png',
        label: 'Accounting Fundamentals',
        url: 'https://www.credential.net/37807813-83a5-4d91-a220-c769f0d55a8d#acc.WRhDUFtj',
      },
      {
        src: '/assets/CFI - Corporate Finance Fundamentals.png',
        label: 'Corporate Finance Fundamentals',
        url: 'https://www.credential.net/9f9bd17a-6e11-47ce-a063-762b74cfee3c#acc.w59Ioqn8',
      },
      {
        src: '/assets/CFI - Excel Fundamentals (Formulas for Finance).png',
        label: 'Excel Fundamentals — Formulas for Finance',
        url: 'https://www.credential.net/d693e870-c91e-4d55-b073-1802057e7305#acc.OcGw4niC',
      },
      {
        src: '/assets/CFI - Financial Analysis Fundamentals.png',
        label: 'Financial Analysis Fundamentals',
        url: 'https://www.credential.net/096ba00d-0b32-4379-810c-13d14eb98a59#acc.wFPi4W8m',
      },
      {
        src: '/assets/CFI - Foreign Exchange Fundamentals.png',
        label: 'Foreign Exchange Fundamentals',
        url: 'https://www.credential.net/02971b69-e741-42fc-acee-be96cc263037#acc.Y9fAG6VD',
      },
      {
        src: '/assets/CFI - Introduction to Banking.png',
        label: 'Introduction to Banking',
        url: 'https://www.credential.net/86729b89-47c1-46cc-9363-f6566fd11493#acc.opn7kOMX',
      },
      {
        src: '/assets/CFI - Reading Financial Statements.png',
        label: 'Reading Financial Statements',
        url: 'https://www.credential.net/75494241-347c-4f0c-bed2-c624aafc48f1#acc.osfu1yEL',
      },
    ],
  },
  kellogg: {
    title: 'Product Strategy — Kellogg (not started)',
    pending: true,
    noClick: true,
    images: [],
  },
};

export const CERT_BADGES = [
  { key: 'psm',     label: 'PSM I — Scrum Master',          pending: false, noClick: false },
  { key: 'lss',     label: 'Lean Six Sigma Black Belt',      pending: false, noClick: false },
  { key: 'ux',      label: 'UX Design — Accenture',          pending: false, noClick: false },
  { key: 'ibm',     label: 'Enterprise Design Thinking — IBM', pending: false, noClick: false },
  { key: 'fmva',    label: 'FMVA — CFI',                     pending: true,  noClick: false, inProgressLabel: 'in progress' },
  { key: 'kellogg', label: 'Product Strategy — Kellogg',     pending: true,  noClick: true,  inProgressLabel: 'not started' },
];
