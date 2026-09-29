import { useEffect, useState } from 'react';
import type { Photo } from '../data/content';
import { usePrefersReducedMotion } from '../hooks/useReveal';

interface Props {
  photos: Photo[];
}

/** Hero 照片轮播：主卡淡入淡出 + 两侧扇形副卡 + 自动播放 */
export function HeroCarousel({ photos }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const n = photos.length;
  const go = (i: number) => setIndex(((i % n) + n) % n);

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), 4200);
    return () => window.clearInterval(id);
  }, [paused, reduced, n]);

  const prev = (index - 1 + n) % n;
  const next = (index + 1) % n;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="果子的照片轮播"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 背后光晕 */}
      <div className="absolute -inset-8 bg-gradient-to-br from-pink/25 via-violet/15 to-transparent blur-3xl rounded-full" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[400px]">
        {/* 扇形副卡（平板以上显示） */}
        <button
          type="button"
          onClick={() => go(prev)}
          aria-label="上一张"
          className="hidden sm:block absolute -left-14 top-1/2 -translate-y-1/2 -rotate-8 w-40 aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white opacity-60 hover:opacity-90 hover:scale-105 transition-all cursor-pointer z-0 shadow-[0_12px_36px_rgba(74,53,64,0.15)]"
        >
          <img src={photos[prev].src} alt="" className="w-full h-full object-cover" />
        </button>
        <button
          type="button"
          onClick={() => go(next)}
          aria-label="下一张"
          className="hidden sm:block absolute -right-14 top-1/2 -translate-y-1/2 rotate-8 w-40 aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white opacity-60 hover:opacity-90 hover:scale-105 transition-all cursor-pointer z-0 shadow-[0_12px_36px_rgba(74,53,64,0.15)]"
        >
          <img src={photos[next].src} alt="" className="w-full h-full object-cover" />
        </button>

        {/* 主卡 */}
        <div className="relative z-10 aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_24px_80px_rgba(255,107,138,0.35)]">
          {photos.map((p, i) => (
            <img
              key={p.src}
              src={p.src}
              alt={i === index ? `果子：${p.caption}` : ''}
              aria-hidden={i !== index}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === index ? 'opacity-100 carousel-kenburns' : 'opacity-0'
              }`}
            />
          ))}
          {/* 底部压角渐变 + 序号 */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-3.5 right-3.5">
            <span className="rounded-full bg-ink/55 backdrop-blur px-2.5 py-1.5 text-[11px] text-cream/75 tabular-nums">
              {index + 1} / {n}
            </span>
          </div>
        </div>

        {/* 指示点 */}
        <div className="mt-5 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`第 ${i + 1} 张`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-pink' : 'w-2 bg-ink/15 hover:bg-ink/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
