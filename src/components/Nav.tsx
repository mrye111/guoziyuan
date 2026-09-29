import { useEffect, useState } from 'react';
import { content } from '../data/content';

const LINKS = [
  { href: '#calendar', label: '直播日历' },
  { href: '#clips', label: '高能切片' },
  { href: '#daily', label: '果子的日常' },
  { href: '#stars', label: '星光留言' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink/75 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group shrink-0" aria-label="回到顶部">
          <svg viewBox="0 0 100 100" className="w-7 h-7 transition-transform duration-300 group-hover:rotate-[20deg]" aria-hidden="true">
            <polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="#FF6FA5" stroke="#FF6FA5" strokeWidth="8" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-xl tracking-wide whitespace-nowrap">果子园</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="站内导航">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden md:inline-block px-3.5 py-2 rounded-full text-sm whitespace-nowrap text-cream/85 hover:text-pink hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={content.live.liveUrl}
            target="_blank"
            rel="noopener"
            className="ml-1 px-4 py-2 rounded-full text-[13px] sm:text-sm font-medium whitespace-nowrap bg-pink text-white hover:bg-hotpink transition-colors shadow-[0_4px_16px_rgba(255,111,165,0.4)]"
          >
            去直播间
          </a>
        </nav>
      </div>
    </header>
  );
}
