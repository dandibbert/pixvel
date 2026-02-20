# Pixvel

一个基于 Pixiv API 的小说阅读器，提供优雅的阅读体验。

## 致谢

本项目参考了 [Notsfsssf/pixez-flutter](https://github.com/Notsfsssf/pixez-flutter) 的设计与实现思路。

## 技术栈

### 后端
- **运行时**: Deno 2.x
- **框架**: Hono (轻量级 Web 框架)
- **认证**: OAuth 2.0 (Pixiv)
- **存储**: Deno KV (键值存储)

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios

## 功能特性

- ✅ Pixiv OAuth 2.0 认证
- ✅ 小说搜索（标签、文本、关键词）
- ✅ 小说详情与阅读器
- ✅ 分页阅读（键盘/触摸手势）
- ✅ 阅读历史追踪
- ✅ 收藏功能
- ✅ 响应式设计（移动端/平板/桌面）

## 发布文档

- 发布检查清单: `RELEASE_CHECKLIST.md`
- 变更记录: `CHANGELOG.md`
- 许可证: `LICENSE`

## 本地开发

### 环境要求

- Deno 2.x
- Node.js 18+ (前端开发)
- npm 或 yarn

### 后端设置

1. 克隆仓库
```bash
git clone <repository-url>
cd pixvel
```

2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# Pixiv API 凭证
PIXIV_CLIENT_ID=MOBrBDS8blbauoSck0ZfDbtuzpyT
PIXIV_CLIENT_SECRET=lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj

# Session 密钥（生产环境请更换为随机字符串）
COOKIE_SECRET=your-secret-key-here-change-in-production

# CORS 配置（逗号分隔的允许源）
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# 服务器端口
PORT=8000
```

3. 启动后端开发服务器

```bash
deno task dev
```

后端将运行在 `http://localhost:8000`

### 前端设置

1. 进入前端目录

```bash
cd frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动前端开发服务器

```bash
npm run dev
```

前端将运行在 `http://localhost:3000`

## 部署（前后端一体）

### Deno Deploy 部署

1. 安装 Deno Deploy CLI

```bash
deno install -A --global https://deno.land/x/deploy/deployctl.ts
```

2. 登录 Deno Deploy

```bash
deployctl login
```

3. 创建项目

在 [Deno Deploy Dashboard](https://dash.deno.com) 创建新项目。

4. 配置环境变量

在 Deno Deploy 项目设置中添加以下环境变量：
- `PIXIV_CLIENT_ID`
- `PIXIV_CLIENT_SECRET`
- `COOKIE_SECRET`
- `ALLOWED_ORIGINS`
- `PORT` (可选，默认 8000)

5. 构建前端并一体部署

```bash
npm --prefix frontend run build
deno task deploy
```

说明：
- 前端构建产物在 `frontend/dist`。
- Deno 服务会同时提供 API 与静态页面，无需拆分前后端部署。

手动部署命令：

```bash
deployctl deploy --project=your-project-name src/index.ts
```

## API 端点

### 认证
- `GET /api/auth/login` - 获取 OAuth 登录 URL
- `GET /api/auth/callback` - OAuth 回调处理
- `GET /api/auth/status` - 检查认证状态
- `POST /api/auth/logout` - 登出

### 小说
- `GET /api/novels/search` - 搜索小说
- `GET /api/novels/:id` - 获取小说详情
- `GET /api/novels/:id/content` - 获取小说内容

### 历史
- `GET /api/history` - 获取阅读历史
- `POST /api/history` - 保存阅读位置

### 收藏
- `GET /api/bookmarks` - 获取收藏列表
- `POST /api/bookmarks` - 添加收藏
- `DELETE /api/bookmarks/:id` - 删除收藏

## 响应式设计

### 移动端 (0-640px)
- 单列布局
- 底部 sheet 筛选器
- 全宽卡片
- 触摸友好按钮（最小 44px）
- 左右滑动翻页

### 平板 (641-1024px)
- 2 列网格
- 侧滑筛选面板
- 适中卡片尺寸

### 桌面 (1025px+)
- 3 列网格
- 持久侧边栏
- 大尺寸卡片
- 键盘导航支持

## 开发指南

### 代码规范

后端使用 Deno 内置的格式化和 lint 工具：

```bash
# 仅检查后端源码
deno fmt --check src deno.json
deno lint src
deno check src/index.ts
```

前端建议至少保证可 lint 与可构建：

```bash
cd frontend
npm run lint
npm run build
```

### 项目结构

```
pixvel/
├── src/                    # 后端源码
│   ├── index.ts           # 入口文件
│   ├── middleware/        # 中间件
│   ├── routes/            # 路由处理
│   ├── services/          # 业务逻辑
│   └── utils/             # 工具函数
├── frontend/              # 前端源码
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   ├── stores/       # Zustand 状态
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── services/     # API 服务
│   │   └── utils/        # 工具函数
│   └── public/           # 静态资源
├── deno.json             # Deno 配置
├── .env.example          # 环境变量示例
├── RELEASE_CHECKLIST.md  # 发布检查清单
├── CHANGELOG.md          # 变更记录
├── LICENSE               # 许可证
└── README.md             # 项目文档
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
