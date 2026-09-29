import { useMemo, useState } from 'react';
import { content } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const pad = (n: number) => String(n).padStart(2, '0');
const dateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

interface Cell {
  day: number;
  ds: string;
  isToday: boolean;
  isFuture: boolean;
}

function Chevron({ left }: { left?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {left ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export function LiveCalendar() {
  const ref = useReveal<HTMLDivElement>();
  const now = new Date();
  const todayDs = dateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  /** 按日期分组：同一天多场直播按时间升序排列 */
  const streamMap = useMemo(() => {
    const map = new Map<string, typeof content.streams>();
    content.streams.forEach((s) => {
      const list = map.get(s.date) || [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, []);

  const cells = useMemo(() => {
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // 周一开头
    const list: (Cell | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= days; d++) {
      const ds = dateStr(view.y, view.m, d);
      list.push({ day: d, ds, isToday: ds === todayDs, isFuture: ds > todayDs });
    }
    return list;
  }, [view, todayDs]);

  const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
  const shiftMonth = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const monthCount = cells.filter((c) => c && streamMap.has(c.ds)).length;

  return (
    <section id="calendar" className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-5">
        <SectionHead tag="Live Calendar" title="直播日历" sub="粉色标记的日子有直播，点一下就能看回放" accent="#FF6B8A" />

        <div ref={ref} className="reveal rounded-[2rem] bg-card border border-ink/8 p-4 sm:p-6 shadow-[0_16px_44px_rgba(255,107,138,0.1)]">
          {/* 月份切换 */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="上个月"
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink/70 hover:bg-pink/10 hover:text-pink transition-colors"
            >
              <Chevron left />
            </button>
            <div className="text-center">
              <p className="font-display text-2xl tracking-wide">
                {view.y} 年 {view.m + 1} 月
              </p>
              <p className="text-xs text-mute mt-0.5">
                {monthCount > 0 ? `这个月播了 ${monthCount} 场` : '这个月还没记录'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={isCurrentMonth}
              aria-label="下个月"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isCurrentMonth ? 'text-mute/30 cursor-not-allowed' : 'text-ink/70 hover:bg-pink/10 hover:text-pink'
              }`}
            >
              <Chevron />
            </button>
          </div>

          {/* 星期表头 */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs text-mute py-1">
                {w}
              </div>
            ))}
          </div>

          {/* 日期格子 */}
          <div key={`${view.y}-${view.m}`} className="grid grid-cols-7 gap-1.5 sm:gap-2 calendar-fade">
            {cells.map((c, i) => {
              if (!c) return <div key={`e${i}`} />;
              const sessions = streamMap.get(c.ds);
              if (sessions) {
                const first = sessions[0];
                return (
                  <a
                    key={c.ds}
                    href={first.url}
                    target="_blank"
                    rel="noopener"
                    title={sessions.length > 1 ? `${c.ds} 当天共 ${sessions.length} 场 · 点击看第一场回放` : `${c.ds}「${first.title}」· 点击看回放`}
                    aria-label={sessions.length > 1 ? `${c.ds} 当天共 ${sessions.length} 场直播，点击看回放` : `${c.ds} 直播回放：${first.title}`}
                    className={`aspect-square sm:aspect-auto sm:min-h-[72px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-pink to-hotpink text-white shadow-[0_6px_18px_rgba(255,107,138,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(255,107,138,0.5)] ${
                      c.isToday ? 'ring-2 ring-amber ring-offset-2 ring-offset-card' : ''
                    }`}
                  >
                    <span className="font-display text-base sm:text-lg leading-none">{c.day}</span>
                    <span className="hidden sm:block text-[10px] opacity-95">
                      {sessions.length > 1 ? `回放 ×${sessions.length}` : '回放 ▸'}
                    </span>
                    <span className="sm:hidden w-1 h-1 rounded-full bg-white/90" aria-hidden="true" />
                  </a>
                );
              }
              return (
                <div
                  key={c.ds}
                  className={`aspect-square sm:aspect-auto sm:min-h-[72px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-0.5 ${
                    c.isToday
                      ? 'ring-2 ring-amber ring-offset-2 ring-offset-card font-semibold'
                      : c.isFuture
                        ? 'text-mute/40'
                        : 'text-ink/55'
                  }`}
                >
                  <span className="font-display text-base sm:text-lg leading-none">{c.day}</span>
                  {c.isToday && <span className="text-[10px] text-amber font-bold">今天</span>}
                </div>
              );
            })}
          </div>

          {/* 图例 */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink" aria-hidden="true" />
              当天有直播，点击看回放
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-amber" aria-hidden="true" />
              今天
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
