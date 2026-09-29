import { useEffect, useState } from 'react';
import { content, type Clip } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

export function Clips() {
  const ref = useReveal<HTMLDivElement>();
  const [playing, setPlaying] = useState<Clip | null>(null);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlaying(null);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [playing]);

  return (
    <section id="clips" className="py-24 md:py-32 bg-surface">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Highlight Clips" title="高能切片" sub="错过直播？来这里补课名场面" accent="#B583F0" />
        <div ref={ref} className="reveal grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.clips.map((c) => (
            <button
              key={c.src}
              type="button"
              onClick={() => setPlaying(c)}
              aria-label={`播放切片：${c.title}`}
              className="group text-left rounded-3xl overflow-hidden bg-card border border-ink/8 transition-all duration-200 hover:-translate-y-1.5 hover:border-pink/40 hover:shadow-[0_16px_44px_rgba(255,107,138,0.22)]"
            >
              <div className="relative aspect-video bg-ink/5">
                <img src={c.cover} alt={`切片封面：${c.title}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute bottom-2.5 right-2.5 rounded-md bg-ink/65 backdrop-blur px-2 py-0.5 text-[11px] text-cream/90 tabular-nums">
                  {c.duration}
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
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 站内播放器 */}
      {playing && (
        <div
          className="fixed inset-0 z-[80] bg-ink/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setPlaying(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`播放切片：${playing.title}`}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-cream/95 text-sm sm:text-base font-medium leading-relaxed">{playing.title}</p>
              <button
                type="button"
                onClick={() => setPlaying(null)}
                aria-label="关闭播放器"
                className="shrink-0 w-9 h-9 rounded-full bg-white/15 text-cream text-lg leading-none hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </div>
            <video
              src={playing.src}
              controls
              autoPlay
              playsInline
              className="w-full aspect-video bg-black rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
