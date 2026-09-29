import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

/** 拍立得倾斜角度（确定性，避免每次渲染抖动） */
const TILTS = [-2.4, 1.8, -1.2, 2.6, -2.0, 1.4, -2.8, 2.2, -1.6, 2.4, -2.2, 1.6];

export function PhotoWall() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="daily" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Daily Moments" title="果子的日常" sub="舞台之外的果子，也一样闪闪发光" accent="#FFC95E" />
        <div ref={ref} className="reveal">
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 pt-5 pb-8 lg:grid lg:grid-cols-4 lg:overflow-visible xl:grid-cols-6">
            {content.photos.map((p, i) => (
              <figure
                key={p.src}
                className="group relative shrink-0 w-44 lg:w-auto snap-center bg-[#FFFDF7] rounded-md p-2.5 pb-9 shadow-[0_14px_36px_rgba(0,0,0,0.4)] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}
              >
                <span className="polaroid-tape" aria-hidden="true" />
                <img
                  src={p.src}
                  alt={`果子的日常：${p.caption}`}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-sm"
                />
                <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-display text-[13px] text-[#5A4A42]">
                  {p.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
