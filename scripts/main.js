/* ============================================================
   果子园 · 第一期交互
   内容来自 data/content.json；留言存 localStorage（仅自己可见）
   ============================================================ */
'use strict';

/* fetch 失败（例如直接双击 file:// 打开）时的兜底数据，与 content.json 保持一致 */
const FALLBACK = {
  live: {
    isLive: false,
    liveText: '果子正在直播，快来看！',
    liveUrl: 'https://live.bilibili.com/',
    nextText: '下次直播：周六晚 8 点'
  },
  schedule: [
    { weekday: '周一', isLive: false, time: '', note: '休息日' },
    { weekday: '周二', isLive: true, time: '20:00', note: '游戏回' },
    { weekday: '周三', isLive: false, time: '', note: '休息日' },
    { weekday: '周四', isLive: true, time: '20:00', note: '歌回' },
    { weekday: '周五', isLive: true, time: '21:00', note: '深夜杂谈' },
    { weekday: '周六', isLive: true, time: '20:00', note: '高能游戏日' },
    { weekday: '周日', isLive: true, time: '15:00', note: '下午茶杂谈' }
  ],
  clips: [
    { title: '【高能】果子一嗓子把队友唱哭了', plays: '12.6万', date: '2026-09-20', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'green', fruit: 'apple' },
    { title: '名场面：果子的反向 Flag 现场', plays: '8.9万', date: '2026-09-14', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'pink', fruit: 'peach' },
    { title: '三分钟看完果子的首播名场面', plays: '15.2万', date: '2026-09-06', platform: '抖音', url: 'https://www.douyin.com/', theme: 'yellow', fruit: 'strawberry' },
    { title: '果子与猫の巅峰对决', plays: '6.4万', date: '2026-08-28', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'pink', fruit: 'apple' },
    { title: '深夜电台：果子读留言读到哽咽', plays: '9.8万', date: '2026-08-20', platform: '抖音', url: 'https://www.douyin.com/', theme: 'green', fruit: 'peach' },
    { title: '果子教你做苹果派（翻车了）', plays: '11.1万', date: '2026-08-12', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'yellow', fruit: 'strawberry' }
  ],
  fanwall: {
    tip: '想上墙？投稿到',
    email: 'guoziyuan@example.com',
    works: [
      { author: '桃桃乌龙', theme: 'pink', fruit: 'peach', ratio: '4:3' },
      { author: '一颗小苹果', theme: 'green', fruit: 'apple', ratio: '1:1' },
      { author: '草莓大福', theme: 'yellow', fruit: 'strawberry', ratio: '3:4' },
      { author: '果园园丁甲', theme: 'green', fruit: 'strawberry', ratio: '4:3' },
      { author: '芝士奶盖', theme: 'yellow', fruit: 'apple', ratio: '1:1' },
      { author: '路过的蚂蚁', theme: 'pink', fruit: 'apple', ratio: '3:4' },
      { author: '西瓜太郎', theme: 'green', fruit: 'peach', ratio: '4:3' },
      { author: '糖分超标', theme: 'pink', fruit: 'strawberry', ratio: '1:1' }
    ]
  },
  tree: {
    maxLength: 50,
    notice: '留言会保存在你的浏览器里（localStorage），只有你自己能看到哦～',
    seedMessages: [
      { name: '果小糖', text: '果子加油！每天看你直播下饭！' },
      { name: '苹果核', text: '从首播追到现在，果子越来越棒了' },
      { name: '桃气包', text: '周六的直播我设了三个闹钟' },
      { name: '草莓籽', text: '高能切片已经循环了一百遍' },
      { name: '小叶子', text: '果子要天天开心呀' },
      { name: '果园保安', text: '守护全世界最好的果子' }
    ]
  },
  social: [
    { name: 'B站', icon: 'tv', url: 'https://space.bilibili.com/' },
    { name: '抖音', icon: 'music', url: 'https://www.douyin.com/' },
    { name: '微博', icon: 'at', url: 'https://weibo.com/' }
  ]
};

const THEME = {
  green: { bg: '#E8F6E3', main: '#7BC96F' },
  pink: { bg: '#FFEDF1', main: '#FFB6C1' },
  yellow: { bg: '#FFF6DC', main: '#FFD166' }
};

/* 留言果子在树冠上的挂点（相对 tree-wrap 的百分比坐标） */
const SLOTS = [
  [17, 40], [26, 30], [36, 23], [47, 18], [58, 19], [68, 25], [77, 32], [83, 42],
  [22, 52], [32, 60], [44, 64], [56, 65], [67, 61], [76, 52],
  [38, 42], [52, 36], [62, 46], [47, 53], [30, 44], [66, 38]
];
const FRUIT_COLORS = ['green', 'pink', 'yellow'];
const STORE_KEY = 'guoziyuan.messages.v1';
const CHEER_KEY = 'guoziyuan.cheerCount';
const SOUND_KEY = 'guoziyuan.sound';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- 线性图标（Lucide 风格，2px 圆头描边） ---------- */
function lineIcon(inner, size = 16) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
const ICONS = {
  clock: lineIcon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.02 1.02 0 0 0 0-1.76L9.56 4.26A1.02 1.02 0 0 0 8 5.14Z"/></svg>',
  playSmall: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.5-6.86a1.02 1.02 0 0 0 0-1.76L9.56 4.26A1.02 1.02 0 0 0 8 5.14Z"/></svg>',
  mail: lineIcon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>', 17),
  heart: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  tv: lineIcon('<rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>', 20),
  music: lineIcon('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 20),
  at: lineIcon('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>', 20)
};

/* ---------- 扁平水果插画 ---------- */
function fruitInner(type) {
  switch (type) {
    case 'peach':
      return '<path d="M50 36 C 30 22 8 36 10 62 C 12 86 32 96 50 96 C 68 96 88 86 90 62 C 92 36 70 22 50 36 Z" fill="#FFB6C1"/>'
        + '<path d="M50 36 C 46 48 46 60 50 74" stroke="#E77E93" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>'
        + '<path d="M50 34 C 50 26 48 20 45 14" stroke="#8B6B4A" stroke-width="5" stroke-linecap="round" fill="none"/>'
        + '<path d="M48 16 C 40 6 26 8 20 18 C 27 28 42 28 48 16 Z" fill="#4E9445"/>'
        + '<ellipse cx="28" cy="54" rx="9" ry="5" fill="#fff" opacity=".4" transform="rotate(-24 28 54)"/>';
    case 'strawberry':
      return '<path d="M50 30 C 76 30 90 44 86 62 C 82 82 62 96 50 96 C 38 96 18 82 14 62 C 10 44 24 30 50 30 Z" fill="#FF8FA3"/>'
        + '<path d="M50 14 C 50 8 48 6 46 3" stroke="#4E9445" stroke-width="4" stroke-linecap="round" fill="none"/>'
        + '<path d="M30 32 C 34 18 42 12 50 12 C 58 12 66 18 70 32 C 60 25 40 25 30 32 Z" fill="#5FA854"/>'
        + '<g fill="#FFE08A"><ellipse cx="36" cy="52" rx="2.4" ry="3.2"/><ellipse cx="52" cy="48" rx="2.4" ry="3.2"/><ellipse cx="66" cy="54" rx="2.4" ry="3.2"/><ellipse cx="32" cy="68" rx="2.4" ry="3.2"/><ellipse cx="50" cy="64" rx="2.4" ry="3.2"/><ellipse cx="68" cy="70" rx="2.4" ry="3.2"/><ellipse cx="42" cy="80" rx="2.4" ry="3.2"/><ellipse cx="58" cy="82" rx="2.4" ry="3.2"/></g>';
    case 'star':
      return '<polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="#FFD166" stroke="#FFD166" stroke-width="10" stroke-linejoin="round"/>';
    case 'bubble':
      return '<circle cx="50" cy="50" r="40" fill="#fff" opacity=".6"/><ellipse cx="36" cy="36" rx="10" ry="6" fill="#fff" opacity=".9" transform="rotate(-30 36 36)"/>';
    case 'apple':
    default:
      return '<path d="M50 38 C 34 24 12 34 10 58 C 8 82 28 96 50 96 C 72 96 92 82 90 58 C 88 34 66 24 50 38 Z" fill="#7BC96F"/>'
        + '<path d="M50 36 C 50 28 48 22 44 16" stroke="#8B6B4A" stroke-width="5" stroke-linecap="round" fill="none"/>'
        + '<path d="M46 18 C 36 8 22 10 16 20 C 24 30 40 30 46 18 Z" fill="#4E9445"/>'
        + '<ellipse cx="30" cy="52" rx="9" ry="5" fill="#fff" opacity=".4" transform="rotate(-24 30 52)"/>';
  }
}

/* 确定性伪随机，保证封面图案稳定 */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sprinkleDeco(rnd, w, h, color) {
  let deco = '';
  for (let k = 0; k < 7; k++) {
    const cx = (w * 0.05 + rnd() * w * 0.9).toFixed(1);
    const cy = (h * 0.08 + rnd() * h * 0.84).toFixed(1);
    const r = (3 + rnd() * 4).toFixed(1);
    deco += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity=".3"/>`;
  }
  for (let k = 0; k < 3; k++) {
    const x = (w * 0.08 + rnd() * w * 0.84).toFixed(1);
    const y = (h * 0.1 + rnd() * h * 0.8).toFixed(1);
    const s = (0.12 + rnd() * 0.1).toFixed(2);
    deco += `<g transform="translate(${x} ${y}) scale(${s})"><polygon points="50,6 62,37 95,37 68,57 77,90 50,70 23,90 32,57 5,37 38,37" fill="#FFD166" stroke="#FFD166" stroke-width="10" stroke-linejoin="round" opacity=".55"/></g>`;
  }
  return deco;
}

function coverSVG(item, i) {
  const t = THEME[item.theme] || THEME.green;
  const rnd = mulberry32(i * 7 + 3);
  return `<svg class="art" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="400" height="225" fill="${t.bg}"/>
    ${sprinkleDeco(rnd, 400, 225, t.main)}
    <circle cx="272" cy="118" r="88" fill="#fff" opacity=".5"/>
    <g transform="translate(212 52) scale(1.25)">${fruitInner(item.fruit)}</g>
    <path d="M26 196 q12 -14 24 0 t24 0" stroke="${t.main}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
  </svg>`;
}

const RATIO_BOX = { '4:3': [400, 300], '1:1': [400, 400], '3:4': [360, 480] };

function wallArtSVG(work, i) {
  const t = THEME[work.theme] || THEME.green;
  const [w, h] = RATIO_BOX[work.ratio] || RATIO_BOX['4:3'];
  const rnd = mulberry32(i * 13 + 5);
  const scale = (Math.min(w, h) / 100 * 0.5).toFixed(2);
  const fx = (w / 2 - 50 * scale).toFixed(1);
  const fy = (h / 2 - 52 * scale).toFixed(1);
  return `<svg class="art" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" fill="${t.bg}"/>
    ${sprinkleDeco(rnd, w, h, t.main)}
    <circle cx="${w / 2}" cy="${h / 2}" r="${(Math.min(w, h) * 0.36).toFixed(0)}" fill="#fff" opacity=".55"/>
    <g transform="translate(${fx} ${fy}) scale(${scale})">${fruitInner(work.fruit)}</g>
    <path d="M${(w * 0.12).toFixed(0)} ${(h * 0.86).toFixed(0)} q10 -12 20 0 t20 0" stroke="${t.main}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
  </svg>`;
}

function noteSVG(colorKey) {
  const fill = { green: '#7BC96F', pink: '#FFB6C1', yellow: '#FFD66B' }[colorKey] || '#7BC96F';
  return `<svg viewBox="0 0 44 52" aria-hidden="true">
    <path d="M22 13 C22 8 21 5 19 2" stroke="#8B6B4A" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M22 11 C26 4 33 3 37 6 C35 12 28 14 22 11 Z" fill="#5FA854"/>
    <circle cx="22" cy="32" r="17" fill="${fill}"/>
    <ellipse cx="15" cy="26" rx="4.5" ry="3" fill="#fff" opacity=".35" transform="rotate(-25 15 26)"/>
  </svg>`;
}

function floatSVG(type) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${fruitInner(type)}</svg>`;
}

function heartSVG(color) {
  return `<svg viewBox="0 0 24 24" fill="${color}" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
}

/* ---------- 各版块渲染 ---------- */
function renderLiveBanner(live) {
  const el = $('liveBanner');
  if (live.isLive) {
    el.innerHTML = `<span class="live-dot on"></span><span>${esc(live.liveText)}</span>`
      + `<a class="banner-link" href="${esc(live.liveUrl)}" target="_blank" rel="noopener">去看看</a>`;
  } else {
    el.innerHTML = `<span class="live-dot off"></span>${ICONS.clock}<span>${esc(live.nextText)}</span>`;
  }
}

function renderCalendar(schedule) {
  const row = $('calendarRow');
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7; // 周一为一周起点
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIdx);
  row.innerHTML = '';
  schedule.forEach((d, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const card = document.createElement('div');
    card.className = 'day-card ' + (d.isLive ? 'is-live' : 'off');
    card.innerHTML = `<p class="day-week">${esc(d.weekday)}</p>`
      + `<p class="day-date">${date.getMonth() + 1}/${date.getDate()}</p>`
      + (d.isLive
        ? `<p class="day-time">${esc(d.time)}</p><p class="day-note">${esc(d.note)}</p>`
        : `<p class="day-time">—</p><p class="day-note">${esc(d.note || '休息')}</p>`);
    if (i === todayIdx) {
      const badge = document.createElement('span');
      badge.className = 'today-badge';
      badge.textContent = '今天';
      card.appendChild(badge);
    }
    row.appendChild(card);
  });
}

function renderClips(clips) {
  const grid = $('clipGrid');
  grid.innerHTML = '';
  clips.forEach((c, i) => {
    const a = document.createElement('a');
    a.className = 'clip-card';
    a.href = c.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<div class="clip-cover">${coverSVG(c, i)}`
      + `<span class="clip-platform">${esc(c.platform)}</span>`
      + `<span class="clip-play"><span>${ICONS.play}</span></span></div>`
      + `<div class="clip-body"><h3 class="clip-title">${esc(c.title)}</h3>`
      + `<div class="clip-meta"><span>${ICONS.playSmall}${esc(c.plays)}</span><span>${esc(c.date)}</span></div></div>`;
    grid.appendChild(a);
  });
}

function renderFanwall(fanwall) {
  const tip = $('wallTip');
  tip.innerHTML = `<span class="wall-tip-inner">${ICONS.mail}${esc(fanwall.tip)}`
    + `<a href="mailto:${esc(fanwall.email)}">${esc(fanwall.email)}</a></span>`;
  const wall = $('wallMasonry');
  wall.innerHTML = '';
  fanwall.works.forEach((w, i) => {
    const fig = document.createElement('figure');
    fig.className = 'wall-item';
    fig.style.margin = '0 0 18px';
    fig.innerHTML = wallArtSVG(w, i)
      + `<figcaption class="wall-author">${ICONS.heart}<b>${esc(w.author)}</b><span>的二创</span></figcaption>`;
    wall.appendChild(fig);
  });
}

function renderSocial(social) {
  const box = $('footerSocial');
  box.innerHTML = '';
  social.forEach((s) => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = s.name;
    a.setAttribute('aria-label', `果子的${s.name}主页`);
    a.innerHTML = ICONS[s.icon] || ICONS.tv;
    box.appendChild(a);
  });
}

/* ---------- 留言树 ---------- */
let userMessages = [];
let treeData = null;

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

function saveMessages() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(userMessages)); } catch (_) { /* 存储满了就静默失败 */ }
}

function closeAllTips() {
  document.querySelectorAll('.fruit.open').forEach((f) => f.classList.remove('open'));
}

function createFruit(msg, slotIdx) {
  const colorKey = FRUIT_COLORS[slotIdx % FRUIT_COLORS.length];
  const slot = SLOTS[slotIdx % SLOTS.length];
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `fruit fruit-${colorKey}`;
  btn.style.left = slot[0] + '%';
  btn.style.top = slot[1] + '%';
  btn.style.setProperty('--rot', ((slotIdx * 37) % 17 - 8) + 'deg');
  btn.setAttribute('aria-label', `${msg.name}的留言：${msg.text}`);
  btn.innerHTML = noteSVG(colorKey);

  const letter = document.createElement('span');
  letter.className = 'fruit-letter';
  letter.textContent = (msg.name || '果').slice(0, 1);
  letter.setAttribute('aria-hidden', 'true');
  btn.appendChild(letter);

  const tip = document.createElement('span');
  tip.className = 'fruit-tip';
  tip.setAttribute('aria-hidden', 'true');
  const b = document.createElement('b');
  b.textContent = msg.name;
  tip.appendChild(b);
  tip.appendChild(document.createTextNode(msg.text));
  btn.appendChild(tip);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = btn.classList.contains('open');
    closeAllTips();
    if (!wasOpen) btn.classList.add('open');
  });
  return btn;
}

function renderTree() {
  const layer = $('fruitLayer');
  const all = [...treeData.seedMessages, ...userMessages];
  const display = all.slice(-SLOTS.length);
  layer.innerHTML = '';
  display.forEach((m, i) => layer.appendChild(createFruit(m, i)));
  $('treeCount').textContent = `树上已经结出 ${all.length} 颗小果子`;
}

function animateGrow(el) {
  if (reducedMotion || !el) return;
  const wrap = $('treeWrap').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const slotX = r.left + r.width / 2 - wrap.left;
  const slotY = r.top + r.height / 2 - wrap.top;
  const dx = wrap.width * 0.5 - slotX;
  const dy = wrap.height * 0.82 - slotY;
  const rot = getComputedStyle(el).getPropertyValue('--rot') || '0deg';
  el.animate([
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(${rot})`, opacity: 0 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.1) rotate(${rot})`, opacity: 1, offset: 0.4 },
    { transform: `translate(-50%, -50%) scale(1.18) rotate(${rot})`, offset: 0.75 },
    { transform: `translate(-50%, -50%) scale(1) rotate(${rot})`, offset: 1 }
  ], { duration: 800, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
}

/* 轻快音效（WebAudio 合成，无需素材），可关 */
let audioCtx = null;
let soundOn = true;

function popSound() {
  if (!soundOn || reducedMotion) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.09);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  } catch (_) { /* 浏览器不支持就安静 */ }
}

function initSoundToggle() {
  soundOn = localStorage.getItem(SOUND_KEY) !== 'off';
  const btn = $('soundBtn');
  btn.setAttribute('aria-pressed', String(soundOn));
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    btn.setAttribute('aria-pressed', String(soundOn));
    try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (_) { }
    if (soundOn) popSound();
  });
}

function initTreeForm() {
  const form = $('treeForm');
  const msgInput = $('msgInput');
  const nickInput = $('nickInput');
  const charCount = $('charCount');

  msgInput.addEventListener('input', () => {
    charCount.textContent = `${msgInput.value.length} / ${treeData.maxLength}`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nickInput.value.trim().slice(0, 12) || '匿名小果子';
    const text = msgInput.value.trim();
    if (!text) { msgInput.focus(); return; }
    userMessages.push({ name, text, ts: Date.now() });
    if (userMessages.length > 60) userMessages = userMessages.slice(-60);
    saveMessages();
    renderTree();
    const fruits = $('fruitLayer').querySelectorAll('.fruit');
    animateGrow(fruits[fruits.length - 1]);
    popSound();
    burstHearts(form.querySelector('.tree-submit'));
    msgInput.value = '';
    charCount.textContent = `0 / ${treeData.maxLength}`;
    msgInput.focus();
  });

  document.addEventListener('click', closeAllTips);
}

/* ---------- 打 Call 爱心粒子 ---------- */
function burstHearts(anchor) {
  if (reducedMotion || !anchor) return;
  const r = anchor.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    s.className = 'burst-heart';
    s.innerHTML = heartSVG(i % 2 ? '#FF8FA3' : '#FFB6C1');
    const size = 14 + Math.random() * 10;
    s.style.width = s.style.height = size + 'px';
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    document.body.appendChild(s);
    const ang = (-90 + (Math.random() * 140 - 70)) * Math.PI / 180;
    const dist = 50 + Math.random() * 70;
    const x = (Math.cos(ang) * dist).toFixed(1);
    const y = (Math.sin(ang) * dist - 30).toFixed(1);
    const spin = (Math.random() * 60 - 30).toFixed(0);
    const anim = s.animate([
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
      { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${spin}deg)`, opacity: 0 }
    ], { duration: 650 + Math.random() * 250, easing: 'ease-out' });
    anim.onfinish = () => s.remove();
  }
}

function initCheer() {
  const btn = $('cheerBtn');
  const label = $('cheerCount');
  let count = 0;
  try { count = parseInt(localStorage.getItem(CHEER_KEY) || '0', 10) || 0; } catch (_) { }
  const update = () => {
    label.textContent = count > 0 ? `你已经为果子打 Call ${count} 次啦` : '';
  };
  update();
  btn.addEventListener('click', () => {
    count += 1;
    try { localStorage.setItem(CHEER_KEY, String(count)); } catch (_) { }
    burstHearts(btn);
    popSound();
    update();
  });
}

/* ---------- 首屏氛围 ---------- */
function initHeroTitle() {
  const title = $('heroTitle');
  const text = title.textContent;
  title.setAttribute('aria-label', text);
  title.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch;
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    title.appendChild(s);
  });
}

function initFloatLayer() {
  if (reducedMotion || window.innerWidth < 768) return;
  const layer = $('floatLayer');
  const types = ['apple', 'peach', 'strawberry', 'bubble', 'star'];
  for (let i = 0; i < 10; i++) {
    const el = document.createElement('span');
    el.className = 'float-item';
    const size = 22 + Math.random() * 30;
    el.style.left = (3 + Math.random() * 92) + '%';
    el.style.width = el.style.height = size + 'px';
    el.style.animationDuration = (24 + Math.random() * 14) + 's';
    el.style.animationDelay = (-Math.random() * 30) + 's';
    el.innerHTML = floatSVG(types[i % types.length]);
    layer.appendChild(el);
  }
}

/* ---------- 导航与滚动入场 ---------- */
function initNav() {
  const nav = $('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

/* ---------- 启动 ---------- */
async function loadContent() {
  try {
    const res = await fetch('data/content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('bad status');
    return await res.json();
  } catch (_) {
    return FALLBACK;
  }
}

(async function init() {
  const content = await loadContent();
  treeData = content.tree;
  userMessages = loadMessages();

  renderLiveBanner(content.live);
  renderCalendar(content.schedule);
  renderClips(content.clips);
  renderFanwall(content.fanwall);
  renderSocial(content.social);
  renderTree();
  if (content.tree.notice) $('treeNotice').textContent = content.tree.notice;

  initNav();
  initHeroTitle();
  initFloatLayer();
  initReveal();
  initCheer();
  initSoundToggle();
  initTreeForm();
})();
