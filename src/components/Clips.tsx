import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { clipCover } from '../utils/covers';
import { SectionHead } from './SectionHead';

export function Clips() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="clips" className="py-24 md:py-32 bg-surface">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Highlight Clips" title="高能切片" sub="错过直播？来这里补课名场面" accent="#8B7CFF" />
        <div ref={ref} className="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.clips.map((c, i) => (
            <a
              key={c.title}
              href={c.url}
              target="_blank"
              rel="noopener"
              className="group rounded-3xl overflow-hidden bg-card border border-ink/8 transition-all duration-200 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-[0_16px_44px_rgba(255,107,138,0.22)]"
            >
              <div className="relative aspect-video">
                <div dangerouslySetInnerHTML={{ __html: clipCover(c.theme, c.fruit, i) }} className="absolute inset-0" />
                <span className="absolute top-3 left-3 rounded-full bg-white/75 backdrop-blur px-3 py-1 text-xs text-ink/85 shadow-sm">
                  {c.platform}
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-white/90 text-hotpink flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-115">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="ml-0.5" aria-hidden="true">
                      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.02 1.02 0 0 0 0-1.76L9.56 4.26A1.02 1.02 0 0 0 8 5.14Z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-[15px] font-medium leading-relaxed line-clamp-2">{c.title}</h3>
                <div className="mt-2.5 flex items-center gap-4 text-xs text-mute">
                  <span className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.02 1.02 0 0 0 0-1.76L9.56 4.26A1.02 1.02 0 0 0 8 5.14Z" />
                    </svg>
                    {c.plays}
                  </span>
                  <span>{c.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
