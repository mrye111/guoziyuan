# 🍎 果子园

主播果子的官方应援小站 · 第一期（MVP）—— 单页长滚动静态站点，零构建、零依赖，打开即用。

## 快速开始

站点是纯静态文件（HTML + CSS + 原生 JS），任意静态服务器都能跑：

```bash
# 方式一：Python
python -m http.server 8000

# 方式二：Node
npx serve .
```

然后访问 <http://localhost:8000>。

> 直接双击 `index.html` 也能打开，此时会用内置兜底数据渲染（`fetch` 受 file:// 协议限制读不到 JSON）。

## 改内容（不改代码）

所有内容都在 [`data/content.json`](data/content.json) 里，改完刷新即可：

| 字段 | 说明 |
|---|---|
| `live` | 直播状态横幅：`isLive` 切换「直播中 / 下次直播时间」，`liveUrl` 是直播间链接 |
| `schedule` | 直播日历，周一~周日 7 条，`isLive` 的日期会高亮果绿底 |
| `clips` | 高能切片卡片：`title / plays / date / platform / url`，`theme`（green/pink/yellow）和 `fruit`（apple/peach/strawberry）决定封面插画 |
| `fanwall` | 粉丝墙：`email` 换成真实投稿邮箱，`works` 是作品列表（第一期为插画占位） |
| `tree.seedMessages` | 留言树的初始果子留言 |
| `social` | 页脚的平台账号入口（B站/抖音/微博），**记得换成真实主页链接** |

注意：改动 `content.json` 后，建议同步 `scripts/main.js` 顶部的 `FALLBACK` 兜底数据。

## 目录结构

```
├── index.html          # 页面结构（5 个版块 + 页脚）
├── styles/main.css     # 设计令牌 + 全部样式
├── scripts/main.js     # 渲染 + 动效 + 留言树逻辑
├── data/content.json   # 全部站点内容配置
├── assets/favicon.svg  # 小苹果图标
└── docs/design-guide.md # 第一期设计指南存档
```

## 第一期边界

留言存在访问者自己的浏览器 localStorage 里（页面上有明确提示）。用户登录、打榜排行、实时直播状态 API、后端留言板、商城全部留到二期。设计规范与动效参数详见 [docs/design-guide.md](docs/design-guide.md)。

## 部署

推到 GitHub 后：仓库 **Settings → Pages → Source 选 `main` 分支 / `(root)`**，稍等片刻即可通过 `https://mrye111.github.io/guoziyuan/` 访问。
