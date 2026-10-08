import { useEffect, useState } from 'react';
import { content, type LiveStatus } from '../data/content';
import { HeroCarousel } from './HeroCarousel';
import { burstHearts } from '../utils/hearts';

const CHEER_KEY = 'guoziyuan.cheerCount.v2';
const STATUS_URL = `${import.meta.env.BASE_URL}live-status.json`;
const POLL_MS = 120_000;

/** 运行时拉取开播状态（文件由服务器每 5 分钟刷新，页面每 2 分钟轮询） */
function useLiveStatus() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch(STATUS_URL, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (!stop && j) setStatus(j);
        })
        .catch(() => {});
    load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);
  return status;
}

export function Hero() {
  const { live } = content;
  const liveStatus = useLiveStatus();
  const [cheers, setCheers] = useState(() => {
    try {
      return parseInt(localStorage.getItem(CHEER_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  const handleCheer = (e: React.MouseEvent) => {
    burstHearts(e.clientX, e.clientY, 9);
    setCheers((c) => {
      const n = c + 1;
      try {
        localStorage.setItem(CHEER_KEY, String(n));
      } catch {
        /* 隐私模式忽略 */
      }
      return n;
    });
  };

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden flex flex-col">
      {/* 背景氛围：渐变 + 光斑 + 舞台灯柱 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFE4EE] via-cream to-cream" aria-hidden="true" />
      <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-pink/20 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full bg-violet/15 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-0 hidden lg:flex justify-between px-24 items-end opacity-40" aria-hidden="true">
        {['#FF6FA5', '#8B7CFF', '#FFC95E', '#8B7CFF'].map((c, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full hero-light-bar"
            style={{ height: `${52 + (i % 2) * 18}%`, background: `linear-gradient(to top, ${c}66, transparent)`, animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex items-center max-w-6xl mx-auto px-5 w-full pt-24 pb-14">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center w-full">
          {/* 文案列 */}
          <div className="text-center lg:text-left">
            {/* 直播状态（服务器每 5 分钟同步，页面每 2 分钟轮询） */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/75 backdrop-blur-md border border-pink/25 px-4 py-2 text-sm mb-6 shadow-[0_4px_16px_rgba(255,107,138,0.12)]">
              {!liveStatus ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-mute/50 animate-pulse" />
                  <span className="text-ink/60">直播状态获取中…</span>
                </>
              ) : liveStatus.isLive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] live-dot-on" />
                  <span className="max-w-[220px] sm:max-w-xs truncate">
                    果子正在直播{liveStatus.roomName ? `：${liveStatus.roomName}` : '，快来看！'}
                  </span>
                  <a href={live.liveUrl} target="_blank" rel="noopener" className="ml-1 shrink-0 px-3 py-0.5 rounded-full bg-pink text-white text-xs font-medium hover:bg-hotpink transition-colors">
                    去看看
                  </a>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-mute/50" />
                  <span className="text-ink/85">果子还没开播</span>
                  <a href="#calendar" className="ml-1 shrink-0 px-3 py-0.5 rounded-full bg-amber/20 border border-amber/50 text-ink/80 text-xs font-medium hover:bg-amber/40 transition-colors">
                    去补回放
                  </a>
                </>
              )}
            </div>

            {/* 大字标题 */}
            <p className="font-display text-pink tracking-[0.35em] text-sm sm:text-base mb-2">GUOZI LIVE · 官方应援小站</p>
            <h1 className="font-display leading-[0.95] select-none">
              <span className="block text-[clamp(64px,14vw,150px)]">果子</span>
              <span className="block text-[clamp(28px,5.5vw,56px)] text-outline tracking-[0.12em] mt-2">欢迎来到果子园</span>
            </h1>
            <p className="mt-5 text-mute text-[15px] sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
              这里装着果子的每一次高能瞬间：直播日历、切片补课、日常碎片和一片为TA点亮的星空。
            </p>

            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3.5">
              <a
                href={live.liveUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-pink text-white font-medium hover:bg-hotpink hover:-translate-y-0.5 transition-all shadow-[0_8px_28px_rgba(255,111,165,0.45)]"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.02 1.02 0 0 0 0-1.76L9.56 4.26A1.02 1.02 0 0 0 8 5.14Z" />
                </svg>
                去看直播
              </a>
              <a
                href="#clips"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-ink/15 text-ink hover:border-pink/60 hover:text-pink hover:-translate-y-0.5 transition-all"
              >
                补高能切片
              </a>
              <button
                type="button"
                onClick={handleCheer}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-pink hover:bg-pink/10 hover:-translate-y-0.5 transition-all"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                打 Call{cheers > 0 ? ` ×${cheers}` : ''}
              </button>
            </div>
          </div>

          {/* 照片轮播列 */}
          <HeroCarousel photos={content.heroPhotos} />
        </div>
      </div>

      {/* 下滑提示 */}
      <div className="relative z-10 pb-6 flex justify-center" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mute animate-bounce">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
