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

## 直播回放自动同步

直播日历的回放数据在 [`src/data/streams.json`](src/data/streams.json)，**不要手改**——它由脚本从 [B站录像合集](https://space.bilibili.com/3707028832783215/lists/8892206?type=season) 生成：

- **自动**：GitHub Actions 每天北京时间 11:17 抓取一次（`.github/workflows/update-replays.yml`），有新回放会自动提交并触发 Pages 重新部署
- **手动**：`npm run fetch-replays`（Actions 页面也能点 workflow_dispatch 立即跑一次）

脚本按标题解析直播日期（`2026.08.22 20点` 这种格式），同一天多场按时间排序，月历格子上显示「回放 ×N」并链接到第一场。

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
- `fanwall` / `messages` / `social`：粉丝墙、留言配置、平台入口（**记得换成真实链接**）

## 部署

仓库 Settings → Pages → Source 选 **GitHub Actions**，之后每次推送 `main` 自动构建发布到 `https://mrye111.github.io/guoziyuan/`。

## 边界

星光留言存在访问者自己的浏览器 localStorage 里（页面上有明确提示）。原始照片素材放在本地 `果子素材/`（已 gitignore），仓库只提交 `public/photos/` 里的副本。
