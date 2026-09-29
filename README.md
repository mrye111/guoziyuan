# 果子园

主播果子的官方应援小站 · 第二版 —— React + TypeScript + Tailwind CSS + Three.js（React Three Fiber）。

亮点：首屏是一座暗夜爱豆舞台，Q 版果子 3D 建模（齐刘海黑棕发、黑框眼镜、双马尾、打歌服、手麦）在旋转舞台上自动演出，会做眨眼、开心、wink、星星眼、唱歌等表情；点一下她，会转圈回应并爆爱心。

## 本地开发

```bash
npm install --legacy-peer-deps   # @react-three/fiber 的 React Native 可选依赖需要这个标记
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
│   ├── photos/                 # 果子照片（照片墙用）
│   └── favicon.svg
├── src/
│   ├── data/content.ts         # 全部站点内容配置（改内容只动这里）
│   ├── stage/                  # 3D 舞台
│   │   ├── GuoziStage.tsx      #   Canvas 容器 / 视差 / WebGL 兜底
│   │   ├── GuoziCharacter.tsx  #   Q 版果子建模 + 动作 + 表情调度
│   │   ├── FaceTexture.ts      #   脸部表情 Canvas 纹理
│   │   └── StageSet.tsx        #   舞台、灯柱、光束、镜面地板
│   ├── components/             # 导航 / Hero / 直播日历 / 高能切片 / 果子的日常 / 粉丝墙 / 星光留言 / 页脚
│   ├── hooks/useReveal.ts      # 滚动入场
│   └── utils/                  # 爱心粒子、程序生成插画封面
└── .github/workflows/deploy.yml # 推送 main 自动部署 GitHub Pages
```

## 改内容（不改组件代码）

所有文案、排期、切片、照片、留言种子都在 [`src/data/content.ts`](src/data/content.ts)：

- `live`：直播状态横幅（`isLive` 切换直播中/预告）
- `schedule`：周一~周日排期
- `clips`：切片卡片（封面插画由 `theme`/`fruit` 程序生成）
- `photos`：果子的日常照片墙（图片放 `public/photos/`）
- `fanwall` / `messages` / `social`：粉丝墙、留言配置、平台入口（**记得换成真实链接**）

## 部署

仓库 Settings → Pages → Source 选 **GitHub Actions**，之后每次推送 `main` 自动构建发布到 `https://mrye111.github.io/guoziyuan/`。

## 边界

星光留言存在访问者自己的浏览器 localStorage 里（页面上有明确提示）。原始照片素材放在本地 `果子素材/`（已 gitignore），仓库只提交 `public/photos/` 里的副本。
