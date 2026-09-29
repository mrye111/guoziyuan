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
- `streams`：历史直播记录（月历上标粉的日子，`date` 格式 `YYYY-MM-DD`，`url` 填当天回放地址）
- `clips`：切片卡片（封面插画由 `theme`/`fruit` 程序生成）
- `heroPhotos`：首屏照片轮播（图片放 `public/photos/`）
- `photos`：果子的日常照片墙
- `fanwall` / `messages` / `social`：粉丝墙、留言配置、平台入口（**记得换成真实链接**）

## 部署

仓库 Settings → Pages → Source 选 **GitHub Actions**，之后每次推送 `main` 自动构建发布到 `https://mrye111.github.io/guoziyuan/`。

## 边界

星光留言存在访问者自己的浏览器 localStorage 里（页面上有明确提示）。原始照片素材放在本地 `果子素材/`（已 gitignore），仓库只提交 `public/photos/` 里的副本。
