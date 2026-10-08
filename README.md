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

## 表情包广场（公开上传）

- **后端**：`server/meme-api.mjs`（零依赖 node:http），跑在服务器 `127.0.0.1:8787`（systemd 服务 `guoziyuan-api`），nginx 反代 `/api/`
- **存储**：文件在服务器 `/opt/guoziyuan/uploads/files/`（nginx `^~ /memes/uploads/` 直接静态服务），索引 `index.json`
- **防护**：图片魔数白名单（PNG/JPG/GIF/WebP，拒绝 SVG）、8MB 上限、IP 限频（2 张/分钟、15 张/天）、随机文件名、字幕限长去控制字符
- **删除**：上传者凭 localStorage 里的令牌删自己的；管理员用 `/opt/guoziyuan/uploads/admin-token`（请求头 `X-Admin-Token`）可删任意
- 本地开发时 vite 把 `/api` 和 `/memes/uploads` 代理到线上服务器，改动会直接作用于线上数据

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

星光留言存在访问者浏览器 localStorage；表情包广场是**公开共享**的（见上节）；原始照片素材放在本地 `果子素材/`（已 gitignore），仓库只提交 `public/` 里的副本。切片视频不进 git，单独存放在服务器 `/opt/guoziyuan/web/clips/`（Actions 部署已排除该目录）。
