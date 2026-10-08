#!/usr/bin/env node
/**
 * 抓取虎牙直播间开播状态，生成 src/data/live-status.json
 * 只在状态发生变化时写文件（避免每次运行都产生无意义提交）
 * 本地手动运行：npm run fetch-live-status
 * 线上自动运行：.github/workflows/update-live-status.yml 每 10 分钟执行
 */

const ROOM_ID = '158924';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function main() {
  const res = await fetch(`https://mp.huya.com/cache.php?m=Live&do=profileRoom&roomid=${ROOM_ID}`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`虎牙接口 HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 200 || !json.data) {
    throw new Error(`虎牙接口返回异常：${json.message || json.status}`);
  }

  const d = json.data;
  const isLive = d.liveStatus === 'ON';
  const next = {
    isLive,
    nick: d.profileInfo?.nick ?? '',
    roomName: isLive ? d.liveData?.roomName || '' : '',
    game: isLive ? d.liveData?.gameFullName || '' : '',
    startTime: isLive ? d.liveData?.startTime ?? 0 : 0,
    checkedAt: new Date().toISOString(),
  };

  const { readFileSync, writeFileSync } = await import('node:fs');
  // 默认写到仓库 public/（随构建部署）；服务器上 cron 用 LIVE_STATUS_OUT 直接写 web 根目录
  const out = new URL(process.env.LIVE_STATUS_OUT || '../public/live-status.json', import.meta.url);
  let prev = null;
  try {
    prev = JSON.parse(readFileSync(out, 'utf-8'));
  } catch {
    /* 首次运行 */
  }

  const unchanged =
    prev &&
    prev.isLive === next.isLive &&
    prev.roomName === next.roomName &&
    prev.game === next.game &&
    prev.startTime === next.startTime;
  if (unchanged) {
    console.log(`状态无变化（${isLive ? '直播中' : '未开播'}），跳过写入`);
    return;
  }

  writeFileSync(out, JSON.stringify(next, null, 2) + '\n', 'utf-8');
  console.log(`状态已更新：${isLive ? `直播中「${next.roomName || next.game}」` : '未开播'}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
