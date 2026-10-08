# 果子园

主播果子的官方应援小站 · 第二版 —— React + TypeScript + Tailwind CSS + Vite。

亮点：首屏大字排版 + 果子照片轮播（主卡淡入淡出 + 两侧扇形副卡 + 自动播放），全站暗夜爱豆风配色，「果子的日常」拍立得照片墙，留言化作星星挂进夜空。

## 本地开发

```bash
npm install --legacy-peer-deps
npm run dev                      # http://localhost:5173
```

```bash
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 本地预览构建产物
```

## 直播回放 & 开播状态自动同步

| 文件 | 数据源 | 更新方式 |
|---|---|---|
| `src/data/streams.json` | [B站录像合集](https://space.bilibili.com/3707028832783215/lists/8892206?type=season) | Actions 每天北京时间 11:17（`update-replays.yml`） |
| `public/live-status.json` | 虎牙直播间状态接口 | **服务器 cron 每 5 分钟**直写 web 根目录（`/opt/guoziyuan/fetch-live-status.mjs`） |

- 开播状态是**运行时文件**：页面加载时拉取并每 2 分钟轮询，数据更新不需要重新构建部署
- 只有状态发生变化时脚本才写文件；失败时保留上次状态
- 回放脚本按标题解析直播日期（`2026.08.22 20点` 这种格式），同一天多场按时间排序，月历格子显示「回放 ×N」并链接到第一场
- 手动同步：`npm run fetch-replays` / `npm run fetch-live-status`

## 目录结构

```
├── index.html                  # Vite 入口
├── public/
│   ├── photos/                 # 果子照片（轮播 + 照片墙用）
│   └── favicon.svg
├── src/
│   ├── data/content.ts         # 全部站点内容配置（改内容只动这里）
│   ├── components/             # 导航 / Hero / 照片轮播 / 直播日历 / 高能切片 / 果子的日常 / 粉丝墙 / 星光留言 / 页脚
│   ├── hooks/useReveal.ts      # 滚动入场
│   └── utils/                  # 爱心粒子、程序生成插画封面
└── .github/workflows/deploy.yml # 推送 main 自动部署 GitHub Pages
```

## 改内容（不改组件代码）

所有文案、排期、切片、照片、留言种子都在 [`src/data/content.ts`](src/data/content.ts)：

- `live`：直播状态横幅（`isLive` 切换直播中/预告）
- `clips`：切片卡片（封面插画由 `theme`/`fruit` 程序生成）
- `heroPhotos`：首屏照片轮播（图片放 `public/photos/`）
- `photos`：果子的日常照片墙
- `memes`：表情包广场的内置表情包（素材放 `public/memes/`，GIF 直接播放）
- `fanwall` / `messages` / `social`：粉丝墙、留言配置、平台入口（**记得换成真实链接**）

## 部署

推送 `main` 后 GitHub Actions 自动构建并 rsync 部署到自有服务器（`.github/workflows/deploy.yml`）：`ubuntu@101.35.250.122:/opt/guoziyuan/web`，由 nginx 服务 `guoziyuan.cn`。

服务器部署需要在仓库 **Settings → Secrets and variables → Actions** 添加 `GUOZIYUAN_DEPLOY_KEY`（专用部署私钥，公钥已加到服务器 `~ubuntu/.ssh/authorized_keys`）。

## 边界

星光留言存在访问者浏览器 localStorage；用户上传的表情包存在访问者浏览器 IndexedDB（≤40 张，GIF ≤8MB 原样播放，其余压缩到 800px 内），均只有自己可见，页面上有明确提示。原始照片素材放在本地 `果子素材/`（已 gitignore），仓库只提交 `public/` 里的副本。
