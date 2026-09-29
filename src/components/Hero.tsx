import { lazy, Suspense, useState } from 'react';
import { content } from '../data/content';
import { burstHearts } from '../utils/hearts';

const GuoziStage = lazy(() => import('../stage/GuoziStage').then((m) => ({ default: m.GuoziStage })));

/** 舞台加载占位：呼吸光晕 + 小星星 */
function StageSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute w-[60vw] h-[60vw] max-w-[520px] max-h-[520px] rounded-full bg-hotpink/15 blur-3xl animate-pulse" />
      <svg viewBox="0 0 100 100" className="relative w-10 h-10 text-pink/60 animate-pulse" aria-hidden="true">
        <polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="currentColor" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const CHEER_KEY = 'guoziyuan.cheerCount.v2';

export function Hero() {
  const { live } = content;
  const [cheers, setCheers] = useState(() => {
    try {
      return parseInt(localStorage.getItem(CHEER_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  const handleCheer = (x: number, y: number) => {
    burstHearts(x, y, 9);
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
      {/* 3D 舞台 */}
      <div className="absolute inset-0">
        <Suspense fallback={<StageSkeleton />}>
          <GuoziStage onCheer={handleCheer} />
        </Suspense>
      </div>
      {/* 底部压暗渐变，保证文案可读 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent hidden lg:block" />

      {/* 文案层 */}
      <div className="relative z-10 flex-1 flex items-end lg:items-center pointer-events-none">
        <div className="max-w-6xl mx-auto px-5 w-full pb-24 lg:pb-0">
          <div className="max-w-xl pointer-events-auto">
            {/* 直播状态 */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/8 backdrop-blur-md border border-white/10 px-4 py-2 text-sm mb-6">
              {live.isLive ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] live-dot-on" />
                  <span>{live.liveText}</span>
                  <a href={live.liveUrl} target="_blank" rel="noopener" className="ml-1 px-3 py-0.5 rounded-full bg-pink text-white text-xs font-medium hover:bg-hotpink transition-colors">
                    去看看
                  </a>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber" />
                  <span className="text-cream/90">{live.nextText}</span>
                </>
              )}
            </div>

            {/* 大字标题 */}
            <p className="font-display text-pink tracking-[0.35em] text-sm sm:text-base mb-2">GUOZI LIVE · 官方应援小站</p>
            <h1 className="font-display leading-[0.95] select-none">
              <span className="block text-[clamp(64px,14vw,150px)]">果子</span>
              <span className="block text-[clamp(28px,5.5vw,56px)] text-outline tracking-[0.12em] mt-2">欢迎来到果子园</span>
            </h1>
            <p className="mt-5 text-mute text-[15px] sm:text-base leading-relaxed max-w-md">
              这里装着果子的每一次高能瞬间：直播日历、切片补课、日常碎片和一片为TA点亮的星空。
            </p>

            <div className="mt-7 flex flex-wrap gap-3.5">
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
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/15 text-cream hover:border-pink/60 hover:text-pink hover:-translate-y-0.5 transition-all"
              >
                补高能切片
              </a>
            </div>

            <p className="mt-6 text-xs text-mute/80 tracking-wide">
              {cheers > 0 ? `你已经为果子打 Call ${cheers} 次啦 · ` : ''}点小舞台上的果子，TA 会回应你哦
            </p>
          </div>
        </div>
      </div>

      {/* 下滑提示 */}
      <div className="relative z-10 pb-6 flex justify-center pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mute animate-bounce">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
