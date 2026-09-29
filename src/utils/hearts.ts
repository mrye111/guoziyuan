/* 点击爆出爱心粒子（DOM 实现，与 3D 场景解耦） */

const HEART_COLORS = ['#FF6FA5', '#FF4D8D', '#FFC95E', '#8B7CFF'];

const heartPath =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';

export function burstHearts(clientX: number, clientY: number, count = 8) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'burst-heart';
    const size = 14 + Math.random() * 10;
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${clientX}px`;
    s.style.top = `${clientY}px`;
    s.innerHTML = `<svg viewBox="0 0 24 24" fill="${HEART_COLORS[i % HEART_COLORS.length]}"><path d="${heartPath}"/></svg>`;
    document.body.appendChild(s);
    const ang = ((-90 + (Math.random() * 140 - 70)) * Math.PI) / 180;
    const dist = 55 + Math.random() * 80;
    const x = (Math.cos(ang) * dist).toFixed(1);
    const y = (Math.sin(ang) * dist - 30).toFixed(1);
    const spin = (Math.random() * 70 - 35).toFixed(0);
    const anim = s.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 250, easing: 'ease-out' },
    );
    anim.onfinish = () => s.remove();
  }
}
