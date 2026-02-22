# Pixvel

一个基于 Pixiv API 的全栈小说阅读器（Deno + Hono + React）。

## Description

Pixvel 是一个面向 Pixiv Novel 的 Web 阅读应用，当前实现以 **refresh token 登录 + 服务端会话** 为核心：

- 后端负责鉴权、Pixiv 接口代理、阅读进度与历史记录管理；
- 前端提供搜索、列表、系列、作者页和沉浸式阅读器；
- 采用前后端一体部署，Deno 服务同时提供 API 与前端静态资源。

## 当前功能（已实现）

- 认证与会话管理（`/api/auth/setup`、`/api/auth/status`、`/api/auth/logout`）
- 小说搜索（关键词、标签、排序、分页）
- 小说详情与正文获取
- 系列列表与上下篇导航
- 作者小说列表
- 阅读进度保存与历史记录
- 收藏 / 取消收藏 / 收藏列表
- 响应式前端界面（移动端 / 桌面端）

## 技术栈

### 后端

- Deno 2.x
- Hono
- Deno KV
- Pixiv App API（通过服务端代理访问）

### 前端

- React 18 + TypeScript
- Vite
- React Router v6
- Zustand
- Tailwind CSS

## 快速开始

### 1. 环境要求

- Deno 2.x
- Node.js 18+
- npm

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

建议至少配置：

```env
PIXIV_CLIENT_ID=your_pixiv_client_id
PIXIV_CLIENT_SECRET=your_pixiv_client_secret
COOKIE_SECRET=your_cookie_secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
PORT=8000
```

说明：

- 后端在未设置 `PORT` 时默认监听 `8000`；
- 前端开发代理默认转发到 `http://localhost:8000`；如果你改了 `PORT`，请同步修改 `frontend/vite.config.ts` 或设置 `VITE_API_BASE_URL`。

### 3. 启动后端

```bash
deno task dev
```

### 4. 启动前端

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

默认访问：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8000`

## 部署

仓库当前使用的一体部署命令：

```bash
deno task deploy
```

该命令会先构建前端，再执行：

```bash
deno deploy --prod .
```

## API 概览

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/setup`
- `POST /api/auth/refresh`
- `GET /api/auth/status`
- `POST /api/auth/logout`

### Novels

- `GET /api/novels/search`
- `GET /api/novels/user/:userId`
- `GET /api/novels/series/:seriesId`
- `GET /api/novels/:id`
- `GET /api/novels/:id/content`
- `GET /api/novels/:id/series`

### History

- `POST /api/history/position`
- `GET /api/history/position/:id`
- `GET /api/history/novels`

### Bookmarks

- `POST /api/bookmarks/novel`
- `DELETE /api/bookmarks/novel/:id`
- `GET /api/bookmarks/novels`

## 常用命令

```bash
# 后端

deno task dev
deno task start

# 前端

npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint

# 后端质量检查

deno fmt --check src deno.json
deno lint src
deno check src/index.ts
```

## 项目结构

```text
.
├── src/                 # Deno 后端
│   ├── index.ts
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/            # React 前端
│   ├── src/
│   └── public/
├── deno.json
├── .env.example
└── README.md
```

## 致谢

本项目参考了 [Notsfsssf/pixez-flutter](https://github.com/Notsfsssf/pixez-flutter) 的设计与实现思路。

## 许可证

MIT
