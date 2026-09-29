import { useEffect, useRef, useState } from 'react';
import { content } from '../data/content';
import { useReveal, usePrefersReducedMotion } from '../hooks/useReveal';
import { SectionHead } from './SectionHead';

interface StarMsg {
  name: string;
  text: string;
  ts?: number;
}

const STORE_KEY = 'guoziyuan.starMessages.v1';
const SOUND_KEY = 'guoziyuan.sound';

const STAR_COLORS = ['#FFC95E', '#FFF6E3', '#FF9FC0', '#B9AEFF'];

/* 夜空挂点（百分比，避开边缘防止气泡裁切） */
const SLOTS: [number, number][] = [
  [12, 26], [22, 14], [33, 22], [45, 12], [57, 18], [68, 12], [80, 20], [89, 30],
  [16, 44], [28, 38], [40, 46], [52, 36], [63, 44], [75, 38], [86, 50],
  [20, 62], [34, 58], [48, 64], [61, 58], [74, 62], [86, 68], [10, 58],
];

function seededRand(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadMessages(): StarMsg[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

let audioCtx: AudioContext | null = null;
function popSound(enabled: boolean) {
  if (!enabled) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(1180, t + 0.1);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  } catch {
    /* 浏览器不支持就安静 */
  }
}

export function StarMessages() {
  const wrapRef = useReveal<HTMLDivElement>();
  const skyRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [userMsgs, setUserMsgs] = useState<StarMsg[]>(loadMessages);
  const [nick, setNick] = useState('');
  const [text, setText] = useState('');
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== 'off';
    } catch {
      return true;
    }
  });

  const all = [...content.messages.seeds, ...userMsgs];
  const display = all.slice(-SLOTS.length);

  useEffect(() => {
    const close = () => document.querySelectorAll('.star-dot.open').forEach((el) => el.classList.remove('open'));
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    const next = [...userMsgs, { name: nick.trim().slice(0, 12) || '匿名小星星', text: msg, ts: Date.now() }].slice(-60);
    setUserMsgs(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* 存储满了就静默 */
    }
    setText('');
    popSound(soundOn && !reduced);
    // 新星升起动画
    requestAnimationFrame(() => {
      const stars = skyRef.current?.querySelectorAll('.star-dot');
      const el = stars?.[stars.length - 1] as HTMLElement | undefined;
      if (!el || reduced) return;
      el.animate(
        [
          { transform: 'translate(-50%, 160px) scale(0.2)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 1, offset: 0.7 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        ],
        { duration: 850, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
      );
    });
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (next) popSound(true);
  };

  return (
    <section id="stars" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead tag="Star Messages" title="星光留言" sub="写一句话，让它在果子的夜空里亮起来" accent="#FFC95E" />
        <div ref={wrapRef} className="reveal">
          {/* 夜空 */}
          <div
            ref={skyRef}
            className="relative rounded-[2.5rem] overflow-hidden border border-white/8 min-h-[380px] md:min-h-[440px]"
            style={{ background: 'linear-gradient(180deg, #12122A 0%, #1B1233 55%, #241539 100%)' }}
          >
            {/* 背景星点 */}
            {Array.from({ length: 40 }).map((_, i) => {
              const r = seededRand(i * 31 + 7);
              return (
                <span
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    left: `${(r() * 96 + 2).toFixed(1)}%`,
                    top: `${(r() * 88 + 4).toFixed(1)}%`,
                    width: r() > 0.8 ? 3 : 2,
                    height: r() > 0.8 ? 3 : 2,
                    opacity: 0.12 + r() * 0.3,
                  }}
                  aria-hidden="true"
                />
              );
            })}
            {/* 月亮光晕 */}
            <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-amber/15 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-violet/15 blur-3xl" aria-hidden="true" />

            {/* 音效开关 */}
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              title="音效开关"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/8 border border-white/10 text-cream/80 flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              {soundOn ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>

            {/* 留言星星 */}
            {display.map((m, i) => {
              const [sx, sy] = SLOTS[i % SLOTS.length];
              const color = STAR_COLORS[i % STAR_COLORS.length];
              const size = 16 + ((i * 7) % 4) * 4;
              return (
                <button
                  key={`${m.name}-${i}`}
                  type="button"
                  className="star-dot"
                  style={{ left: `${sx}%`, top: `${sy}%`, color }}
                  aria-label={`${m.name}的留言：${m.text}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = e.currentTarget;
                    const wasOpen = el.classList.contains('open');
                    document.querySelectorAll('.star-dot.open').forEach((x) => x.classList.remove('open'));
                    if (!wasOpen) el.classList.add('open');
                  }}
                >
                  <svg viewBox="0 0 100 100" width={size} height={size} style={{ animationDelay: `${(i % 8) * 0.4}s` }} aria-hidden="true">
                    <path d="M50 2 C54 32 68 46 98 50 C68 54 54 68 50 98 C46 68 32 54 2 50 C32 46 46 32 50 2 Z" fill="currentColor" />
                  </svg>
                  <span className="star-tip" aria-hidden="true">
                    <b>{m.name}</b>
                    {m.text}
                  </span>
                </button>
              );
            })}

            <p className="absolute bottom-4 inset-x-0 text-center text-xs text-cream/50 tracking-widest" aria-live="polite">
              夜空里已经有 {all.length} 颗星星在为果子发光
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={submit} className="max-w-xl mx-auto mt-8 rounded-3xl bg-card/80 border border-white/8 p-5 md:p-6 backdrop-blur">
            <div className="mb-4">
              <label htmlFor="starNick" className="block text-sm font-medium mb-1.5 text-cream/90">
                你的昵称
              </label>
              <input
                id="starNick"
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                maxLength={12}
                placeholder="例：果小糖（留空就是匿名小星星）"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-[15px] placeholder:text-mute/60 focus:outline-none focus:border-pink/60 focus:bg-white/8 transition-colors"
              />
            </div>
            <div className="mb-4 relative">
              <label htmlFor="starMsg" className="block text-sm font-medium mb-1.5 text-cream/90">
                想对果子说的话
              </label>
              <textarea
                id="starMsg"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={content.messages.maxLength}
                rows={2}
                required
                placeholder="写点什么吧，限 50 字～"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-[15px] placeholder:text-mute/60 focus:outline-none focus:border-pink/60 focus:bg-white/8 transition-colors resize-none"
              />
              <span className="absolute right-3 bottom-2 text-xs text-mute/70 pointer-events-none">
                {text.length} / {content.messages.maxLength}
              </span>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-pink text-white font-medium py-3 hover:bg-hotpink hover:-translate-y-0.5 transition-all shadow-[0_8px_28px_rgba(255,111,165,0.35)]"
            >
              <svg viewBox="0 0 100 100" width="16" height="16" aria-hidden="true">
                <path d="M50 2 C54 32 68 46 98 50 C68 54 54 68 50 98 C46 68 32 54 2 50 C32 46 46 32 50 2 Z" fill="currentColor" />
              </svg>
              点亮一颗星
            </button>
            <p className="mt-3 flex items-start gap-1.5 text-xs text-mute">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-pink/70" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              {content.messages.notice}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
