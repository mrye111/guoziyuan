import { useReveal } from '../hooks/useReveal';

interface Props {
  tag: string;
  title: string;
  sub?: string;
  accent?: string;
}

export function SectionHead({ tag, title, sub, accent = '#FF6FA5' }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal text-center mb-12 md:mb-16">
      <p className="text-xs tracking-[0.35em] uppercase mb-3" style={{ color: accent }}>
        {tag}
      </p>
      <h2 className="font-display text-4xl md:text-5xl tracking-wide">{title}</h2>
      <svg viewBox="0 0 120 12" className="w-28 mx-auto mt-4" fill="none" aria-hidden="true">
        <path d="M3 8 Q 18 2 33 8 T 63 8 T 93 8 T 117 8" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      </svg>
      {sub && <p className="mt-3 text-mute text-sm md:text-base">{sub}</p>}
    </div>
  );
}
