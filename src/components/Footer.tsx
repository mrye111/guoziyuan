import { content } from '../data/content';

const ICONS = {
  tv: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="15" rx="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  at: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  ),
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/60 py-14 text-center">
      <p className="font-display text-xl flex items-center justify-center gap-2">
        <svg viewBox="0 0 100 100" className="w-5 h-5" aria-hidden="true">
          <polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="#FFC95E" stroke="#FFC95E" strokeWidth="8" strokeLinejoin="round" />
        </svg>
        果子园 · 用爱意浇灌每一天
      </p>
      <div className="mt-6 flex justify-center gap-3.5">
        {content.social.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener"
            title={s.name}
            aria-label={`果子的${s.name}主页`}
            className="w-11 h-11 rounded-full bg-card border border-white/8 text-cream/80 flex items-center justify-center transition-all hover:-translate-y-1 hover:bg-pink hover:text-white hover:border-pink"
          >
            {ICONS[s.icon]}
          </a>
        ))}
      </div>
      <p className="mt-5 text-xs text-mute/70">果子园 · 更多玩法敬请期待</p>
    </footer>
  );
}
