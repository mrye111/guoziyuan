import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { wallArt } from '../utils/covers';
import { SectionHead } from './SectionHead';

export function FanWall() {
  const ref = useReveal<HTMLDivElement>();
  const { fanwall } = content;
  return (
    <section id="fanwall" className="py-24 md:py-32 bg-surface/50">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Fan Works" title="粉丝墙" sub="果园里多才多艺的大家" accent="#8B7CFF" />
        <div ref={ref} className="reveal">
          <p className="text-center mb-10 -mt-6">
            <span className="inline-flex items-center gap-2 flex-wrap justify-center rounded-full bg-amber/12 border border-amber/25 px-5 py-2 text-sm text-cream/90">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              {fanwall.tip}
              <a href={`mailto:${fanwall.email}`} className="text-amber font-medium underline decoration-dashed underline-offset-4 hover:text-cream transition-colors">
                {fanwall.email}
              </a>
            </span>
          </p>
          <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
            {fanwall.works.map((w, i) => (
              <figure
                key={w.author}
                className="break-inside-avoid mb-4 rounded-3xl overflow-hidden bg-card border border-white/5 p-2.5 transition-all duration-200 hover:-translate-y-1 hover:border-violet/30 hover:shadow-[0_14px_40px_rgba(139,124,255,0.16)]"
              >
                <div className="rounded-2xl overflow-hidden" dangerouslySetInnerHTML={{ __html: wallArt(w.theme, w.fruit, w.ratio, i) }} />
                <figcaption className="flex items-center gap-1.5 px-2 pt-2.5 pb-1 text-xs text-mute">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-pink shrink-0" aria-hidden="true">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <b className="text-cream/90 font-medium">{w.author}</b>
                  <span>的二创</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
