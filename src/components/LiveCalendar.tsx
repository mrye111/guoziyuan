import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

export function LiveCalendar() {
  const ref = useReveal<HTMLDivElement>();
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7; // 周一开头
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIdx);

  return (
    <section id="calendar" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Weekly Schedule" title="直播日历" sub="本周果子出没时间表" accent="#FF6FA5" />
        <div ref={ref} className="reveal">
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-3 lg:grid lg:grid-cols-7 lg:overflow-visible">
            {content.schedule.map((d, i) => {
              const date = new Date(monday);
              date.setDate(monday.getDate() + i);
              const isToday = i === todayIdx;
              return (
                <div
                  key={d.weekday}
                  className={`relative shrink-0 w-[108px] lg:w-auto snap-center rounded-3xl p-4 text-center border transition-all duration-200 hover:-translate-y-1.5 ${
                    d.isLive
                      ? 'bg-gradient-to-b from-pink/20 to-violet/10 border-pink/40 shadow-[0_10px_36px_rgba(255,111,165,0.18)]'
                      : 'bg-card border-white/5 hover:border-white/15'
                  }`}
                >
                  {isToday && (
                    <span className="absolute -top-2.5 -right-1 rotate-6 rounded-full bg-amber text-ink text-[11px] font-bold px-2.5 py-0.5 shadow-[0_4px_12px_rgba(255,201,94,0.5)]">
                      今天
                    </span>
                  )}
                  <p className={`text-xs ${d.isLive ? 'text-pink' : 'text-mute'}`}>{d.weekday}</p>
                  <p className="font-display text-2xl mt-1 mb-2">
                    {date.getMonth() + 1}/{date.getDate()}
                  </p>
                  {d.isLive ? (
                    <>
                      <p className="text-sm font-semibold text-cream">{d.time}</p>
                      <p className="text-[11px] text-cream/70 mt-0.5">{d.note}</p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-pink/90 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white live-dot-on" />
                        LIVE
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-mute/70">—</p>
                      <p className="text-[11px] text-mute/60 mt-0.5">{d.note}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-mute">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber" aria-hidden="true">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <path d="M5 3 2 6" />
              <path d="m22 6-3-3" />
              <path d="M6.38 18.7 4 21" />
              <path d="M17.64 18.67 20 21" />
            </svg>
            记得设好小闹钟哦
          </p>
        </div>
      </div>
    </section>
  );
}
