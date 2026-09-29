#!/usr/bin/env node
/**
 * 拉取果子直播录像（B站合集）并生成 src/data/streams.json
 * 数据源：https://space.bilibili.com/3707028832783215/lists/8892206?type=season
 * 本地手动运行：node scripts/fetch-replays.mjs（也可 npm run fetch-replays）
 * 线上自动运行：.github/workflows/update-replays.yml 每天定时执行
 */

const MID = '3707028832783215';
const SEASON_ID = '8892206';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const REFERER = `https://space.bilibili.com/${MID}/lists/${SEASON_ID}?type=season`;
const PAGE_SIZE = 30;

async function fetchPage(pageNum) {
  const url =
    `https://api.bilibili.com/x/polymer/web-space/seasons_archives_list` +
    `?mid=${MID}&season_id=${SEASON_ID}&sort_reverse=true&page_num=${pageNum}&page_size=${PAGE_SIZE}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: REFERER } });
  if (!res.ok) throw new Error(`B站接口 HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`B站接口返回 code=${json.code}：${json.message}`);
  return json.data;
}

/** 北京时间日期（合集录像标题与发布时间都以北京时间为准） */
function beijingDate(sec) {
  return new Date(sec * 1000 + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 优先从标题解析直播日期（如「2026.08.22 20点 直播回放…」），解析不到回退到发布日期 */
function dateFromTitle(title) {
  const m = title.match(/(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

/** 从标题解析场次时间（如「20点」→ 20），用于同一天多场排序 */
function hourFromTitle(title) {
  const m = title.match(/(\d{1,2})点/);
  return m ? parseInt(m[1], 10) : 0;
}

async function main() {
  const all = [];
  let page = 1;
  let total = Infinity;
  while (all.length < total) {
    const data = await fetchPage(page);
    total = data.page.total;
    if (!data.archives.length) break;
    all.push(...data.archives);
    page += 1;
    if (all.length < total) await new Promise((r) => setTimeout(r, 400)); // 友好限速
  }

  // 按日期升序；同一天多场按标题里的时间（09点/12点/20点）升序
  const streams = all
    .map((a) => ({
      date: dateFromTitle(a.title) || beijingDate(a.pubdate),
      title: a.title,
      url: `https://www.bilibili.com/video/${a.bvid}`,
      h: hourFromTitle(a.title),
    }))
    .filter((s) => s.date)
    .sort((a, b) => a.date.localeCompare(b.date) || a.h - b.h)
    .map(({ h, ...s }) => s);

  const { writeFileSync } = await import('node:fs');
  const out = new URL('../src/data/streams.json', import.meta.url);
  writeFileSync(out, JSON.stringify(streams, null, 2) + '\n', 'utf-8');

  const days = new Set(streams.map((s) => s.date)).size;
  console.log(`已更新 src/data/streams.json：${streams.length} 条回放，覆盖 ${days} 个直播日`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
