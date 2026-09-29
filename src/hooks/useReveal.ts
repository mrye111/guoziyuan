import { useEffect, useRef } from 'react';

/** IntersectionObserver 滚动入场：进入视口后加 is-visible，仅一次 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

export function usePrefersReducedMotion() {
  const ref = useRef(false);
  if (typeof window !== 'undefined' && !ref.current) {
    ref.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return ref.current;
}
