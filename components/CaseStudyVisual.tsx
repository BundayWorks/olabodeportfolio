import type { CaseStudyCard } from '@/data/caseStudies';

type VisualType = CaseStudyCard['visualType'];

export default function CaseStudyVisual({
  type,
  bgColor,
  image,
}: {
  type: VisualType;
  bgColor: string;
  image?: { src: string; alt: string; position?: string };
}) {
  if (image) {
    return (
      <div className="case-study__image-wrap" style={{ background: bgColor }}>
        <img
          src={image.src}
          alt={image.alt}
          className="case-study__image"
          style={image.position ? { objectPosition: image.position } : undefined}
        />
      </div>
    );
  }
  return (
    <div className="case-study__placeholder" style={{ background: bgColor, width: '100%', height: '100%' }}>
      {type === 'window' && (
        <div className="mock-window">
          <div className="mock-bar" />
          <div className="mock-rows">
            <div className="mock-row wide" />
            <div className="mock-row medium" />
            <div className="mock-row" />
          </div>
        </div>
      )}
      {type === 'emoji' && (
        <div className="emoji-grid">
          <span>📋</span><span>📊</span><span>✅</span>
        </div>
      )}
      {type === 'chat' && (
        <div className="mock-chat">
          <div className="bubble left" />
          <div className="bubble right" />
          <div className="bubble left short" />
        </div>
      )}
      {type === 'board' && (
        <div className="mock-board">
          <div className="board-col">
            <div className="board-card" />
            <div className="board-card" />
          </div>
          <div className="board-col">
            <div className="board-card" />
          </div>
        </div>
      )}
      {type === 'icons' && (
        <div className="icon-cluster">
          <div className="icon-blob blue">
            <svg viewBox="0 0 60 60" width="54" height="54">
              <circle cx="30" cy="30" r="28" fill="#29b6f6" />
              <rect x="18" y="22" width="24" height="16" rx="3" fill="#fff" />
            </svg>
          </div>
          <div className="icon-blob teal">
            <svg viewBox="0 0 60 60" width="40" height="40">
              <circle cx="30" cy="30" r="28" fill="#26c6da" />
              <polyline points="18,36 26,26 34,32 42,22" stroke="#fff" strokeWidth="3" fill="none" />
            </svg>
          </div>
        </div>
      )}
      {type === 'chart' && (
        <div className="mock-chart">
          <div className="bar" style={{ height: '40%' }} />
          <div className="bar" style={{ height: '65%' }} />
          <div className="bar" style={{ height: '50%' }} />
          <div className="bar" style={{ height: '80%' }} />
          <div className="bar" style={{ height: '60%' }} />
        </div>
      )}
    </div>
  );
}
