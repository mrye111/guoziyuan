/* 程序生成的扁平水果插画封面（暗夜主题配色，无绿色） */

type ThemeKey = 'pink' | 'violet' | 'amber';
type Fruit = 'apple' | 'peach' | 'strawberry';

const THEMES: Record<ThemeKey, { bg: string; main: string }> = {
  pink: { bg: '#2B1624', main: '#FF6FA5' },
  violet: { bg: '#1B1830', main: '#8B7CFF' },
  amber: { bg: '#2A2111', main: '#FFC95E' },
};

function fruitInner(type: Fruit): string {
  const leaf = '#8B7CFF'; // 叶子统一用点缀紫，避开绿色
  const stem = '#7A5C48';
  switch (type) {
    case 'peach':
      return (
        '<path d="M50 36 C 30 22 8 36 10 62 C 12 86 32 96 50 96 C 68 96 88 86 90 62 C 92 36 70 22 50 36 Z" fill="#FF9FB8"/>' +
        '<path d="M50 36 C 46 48 46 60 50 74" stroke="#E76B8E" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>' +
        `<path d="M50 34 C 50 26 48 20 45 14" stroke="${stem}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
        `<path d="M48 16 C 40 6 26 8 20 18 C 27 28 42 28 48 16 Z" fill="${leaf}"/>` +
        '<ellipse cx="28" cy="54" rx="9" ry="5" fill="#fff" opacity=".4" transform="rotate(-24 28 54)"/>'
      );
    case 'strawberry':
      return (
        '<path d="M50 30 C 76 30 90 44 86 62 C 82 82 62 96 50 96 C 38 96 18 82 14 62 C 10 44 24 30 50 30 Z" fill="#FF5D7A"/>' +
        `<path d="M50 14 C 50 8 48 6 46 3" stroke="${leaf}" stroke-width="4" stroke-linecap="round" fill="none"/>` +
        `<path d="M30 32 C 34 18 42 12 50 12 C 58 12 66 18 70 32 C 60 25 40 25 30 32 Z" fill="${leaf}"/>` +
        '<g fill="#FFE08A"><ellipse cx="36" cy="52" rx="2.4" ry="3.2"/><ellipse cx="52" cy="48" rx="2.4" ry="3.2"/><ellipse cx="66" cy="54" rx="2.4" ry="3.2"/><ellipse cx="32" cy="68" rx="2.4" ry="3.2"/><ellipse cx="50" cy="64" rx="2.4" ry="3.2"/><ellipse cx="68" cy="70" rx="2.4" ry="3.2"/><ellipse cx="42" cy="80" rx="2.4" ry="3.2"/><ellipse cx="58" cy="82" rx="2.4" ry="3.2"/></g>'
      );
    case 'apple':
    default:
      return (
        '<path d="M50 38 C 34 24 12 34 10 58 C 8 82 28 96 50 96 C 72 96 92 82 90 58 C 88 34 66 24 50 38 Z" fill="#FF5D7A"/>' +
        `<path d="M50 36 C 50 28 48 22 44 16" stroke="${stem}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
        `<path d="M46 18 C 36 8 22 10 16 20 C 24 30 40 30 46 18 Z" fill="${leaf}"/>` +
        '<ellipse cx="30" cy="52" rx="9" ry="5" fill="#fff" opacity=".4" transform="rotate(-24 30 52)"/>'
      );
  }
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sprinkles(rnd: () => number, w: number, h: number, color: string): string {
  let out = '';
  for (let k = 0; k < 7; k++) {
    const cx = (w * 0.05 + rnd() * w * 0.9).toFixed(1);
    const cy = (h * 0.08 + rnd() * h * 0.84).toFixed(1);
    const r = (3 + rnd() * 4).toFixed(1);
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity=".35"/>`;
  }
  for (let k = 0; k < 3; k++) {
    const x = (w * 0.08 + rnd() * w * 0.84).toFixed(1);
    const y = (h * 0.1 + rnd() * h * 0.8).toFixed(1);
    const s = (0.12 + rnd() * 0.1).toFixed(2);
    out += `<g transform="translate(${x} ${y}) scale(${s})"><polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="#FFC95E" stroke="#FFC95E" stroke-width="10" stroke-linejoin="round" opacity=".6"/></g>`;
  }
  return out;
}

export function clipCover(theme: ThemeKey, fruit: Fruit, seed: number): string {
  const t = THEMES[theme];
  const rnd = mulberry32(seed * 7 + 3);
  return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%">
    <rect width="400" height="225" fill="${t.bg}"/>
    ${sprinkles(rnd, 400, 225, t.main)}
    <circle cx="272" cy="118" r="88" fill="${t.main}" opacity=".14"/>
    <circle cx="272" cy="118" r="60" fill="${t.main}" opacity=".12"/>
    <g transform="translate(212 52) scale(1.25)">${fruitInner(fruit)}</g>
    <path d="M26 196 q12 -14 24 0 t24 0" stroke="${t.main}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}

const RATIO_BOX: Record<string, [number, number]> = { '4:3': [400, 300], '1:1': [400, 400], '3:4': [360, 480] };

export function wallArt(theme: ThemeKey, fruit: Fruit, ratio: string, seed: number): string {
  const t = THEMES[theme];
  const [w, h] = RATIO_BOX[ratio] || RATIO_BOX['4:3'];
  const rnd = mulberry32(seed * 13 + 5);
  const scale = (Math.min(w, h) / 100) * 0.52;
  const fx = (w / 2 - 50 * scale).toFixed(1);
  const fy = (h / 2 - 52 * scale).toFixed(1);
  return `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;height:auto">
    <rect width="${w}" height="${h}" fill="${t.bg}"/>
    ${sprinkles(rnd, w, h, t.main)}
    <circle cx="${w / 2}" cy="${h / 2}" r="${Math.round(Math.min(w, h) * 0.36)}" fill="${t.main}" opacity=".14"/>
    <g transform="translate(${fx} ${fy}) scale(${scale.toFixed(2)})">${fruitInner(fruit)}</g>
    <path d="M${Math.round(w * 0.12)} ${Math.round(h * 0.86)} q10 -12 20 0 t20 0" stroke="${t.main}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}
