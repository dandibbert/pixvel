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
- React Router v7
- Zustand
- Tailwind CSS

## 快速开始

### 1. 环境要求

- Deno 2.x
- Node.js 20+
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

该命令会依次执行：构建前端 → 生成 `build-info.json`（记录本次上传内容对应的 commit 与文件指纹）→ 调用 `scripts/publish.sh` 上传。

部署目标不写在仓库里：本地请在 `.env.deploy` 中设置 `DENO_DEPLOY_ORG` 与 `DENO_DEPLOY_APP`（`.env.*` 已被 `.gitignore` 忽略），缺任何一个都会直接报错退出。

```env
DENO_DEPLOY_ORG=your_org
DENO_DEPLOY_APP=your_app
```

`scripts/publish.sh` 是本地与 CI 共用的上传入口，它还处理两件杂事：

- Deno 2.9.x 的 `deno deploy` 子命令会把参数重复传两遍，导致它拒绝自己的 `--prod`、`--org` 等标志；脚本先探测再自动改用 `deno run -A jsr:@deno/deploy`，两种 Deno 版本都能用。
- 部署不应该反过来改动项目本身：Deploy CLI 成功后会把解析到的 org / app 写回 `deno.json`，从 JSR 运行时还会把自己的依赖记进 `deno.lock`。脚本用 `--no-lock` 并在结束时还原这两个文件，既避免账号信息被提交，也避免工作区与刚上传的内容不一致导致 `deploy:check` 误报。

### 通过 GitHub Actions 部署

推送到 `main` 会触发 `.github/workflows/deploy.yml`；也可以在 Actions 页手动运行（紧急情况下可勾选 `skip_checks` 跳过检查）。

需要在仓库里配置：

| 类型 | 名称 | 是否必需 | 说明 |
| --- | --- | --- | --- |
| Secret | `DENO_DEPLOY_TOKEN` | 必需 | 在 Deno Deploy 控制台 Account → Access Tokens 生成；这是唯一的凭据 |
| Variable | `DENO_DEPLOY_ORG` | 必需 | 组织 slug，仓库里不再硬编码 |
| Variable | `DENO_DEPLOY_APP` | 必需 | 应用名；非交互模式下 CLI 不会自动推断 |
| Variable | `DEPLOY_URL` | 可选 | 设置后部署结束会自动校验线上版本 |

添加位置是 Settings → Secrets and variables → Actions：token 放 **Secrets** 标签页，org / app / URL 放 **Variables** 标签页。工作流两个标签页都会读，所以放错了也能跑；但必须是仓库级（Repository）配置，只加在某个 Environment 下的不会被读到。

前三项缺任何一个，部署 job 都会在第一步带着明确提示失败。org / app 本身不是机密（应用名已经体现在线上域名里），放进 Variables 只是为了不让仓库绑死在某个账号上。

工作流会先跑 `.github/workflows/ci.yml`（后端 `fmt` / `lint` / `check` / `test`，前端 `lint` / `test` / `build`），其中一步会校验提交的 `frontend/dist` 与源码重新构建的结果完全一致——构建产物是提交进仓库的，`deno deploy` 上传时又会跳过被 `.gitignore` 忽略的文件，所以产物过期必须在部署前拦下。检查通过后，部署步骤**原样上传当前 commit 的工作区**（不再重新构建），因此任何人 checkout 同一个 commit 都能用 `deno task deploy:check` 校验出 `Match`。

配置了 `DEPLOY_URL` 时，部署完成后工作流会轮询 `/api/version`，确认线上跑的确实是这次上传的那份代码，否则 job 失败。

### 确认线上跑的是哪个版本

```bash
# 直接查看线上版本
curl https://<你的应用域名>/api/version

# 与本地工作区逐文件比对
deno task deploy:check https://<你的应用域名>
```

`deploy:check` 会把线上返回的 `treeHash` 与本地即将上传的文件集合指纹对比：

- `Match`：线上代码与当前工作区完全一致；
- `Mismatch`：两者不同（退出码 `1`），输出会区分「同一 commit 但文件不同」与「commit 就不一样」；
- `Cannot compare`：线上是加入版本标记之前的旧部署，重新 `deno task deploy` 一次即可。

`treeHash` 覆盖所有会被上传的文件（含 `frontend/dist` 构建产物，但不含 `build-info.json` 自身），因此即使没有提交也能判断线上跑的到底是不是本地这份代码。`commit` 字段记录的是生成 `build-info.json` 时的 HEAD；如果之后把 `build-info.json` 单独提交了一次，它会比本地 HEAD 落后一个提交，此时以 `treeHash` 为准。

## API 概览

### Health

- `GET /api/health`
- `GET /api/version`

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

deno fmt --check src scripts deno.json
deno lint src scripts
deno check src/index.ts
deno task test
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
├── scripts/             # 部署与版本校验脚本
├── build-info.json      # 部署时生成的版本标记
├── deno.json
├── .env.example
└── README.md
```

## 致谢

本项目参考了 [Notsfsssf/pixez-flutter](https://github.com/Notsfsssf/pixez-flutter) 的设计与实现思路。

## 许可证

MIT
