import { marqueeItems } from '../data/content';

function Star() {
  return (
    <svg viewBox="0 0 100 100" className="w-4 h-4 shrink-0" aria-hidden="true">
      <polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="currentColor" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );
}

export function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div className="border-y border-white/5 bg-surface/70 py-3.5 overflow-hidden" aria-hidden="true">
      <div className="marquee-track items-center gap-8 text-sm tracking-[0.2em] text-mute">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className={i % 2 ? 'text-cream/80' : ''}>{item}</span>
            <span className={i % 3 === 0 ? 'text-pink' : i % 3 === 1 ? 'text-violet' : 'text-amber'}>
              <Star />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
