# GitHub 发布前检查清单

## 1. 质量检查（发布前必跑）

在项目根目录运行：

```bash
deno fmt --check src deno.json
deno lint src
deno check src/index.ts
cd frontend && npm run build
```

说明：
- 当前前端 `npm run lint` 需要先补 ESLint 配置后再作为发布门禁。
- `frontend/dist` 为构建产物，不应提交到仓库。

## 2. 安全检查

- 确保 `.env`、`frontend/.env` 不进入 Git（已在 `.gitignore` 中配置）。
- 发布前确认生产环境 `COOKIE_SECRET` 为高强度随机值。
- 若历史上曾提交过密钥，先轮换密钥再公开仓库。

## 3. 文档检查

- README 中的本地开发、部署说明与当前命令一致。
- `CHANGELOG.md` 已记录本次改动。
- LICENSE 已存在并与 README 的许可证声明一致。

## 4. 首次发布到 GitHub

```bash
# 在项目根目录
git init
git add .
git commit -m "chore: prepare project for github release"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 5. 推荐首个版本标签（可选）

```bash
git tag -a v0.1.0 -m "First public release"
git push origin v0.1.0
```
