# GitHub 发布前检查清单

## 1. 质量检查（发布前必跑）

在项目根目录运行：

```bash
deno fmt --check src scripts deno.json
deno lint src scripts
deno check src/index.ts
deno task test
cd frontend && npm run lint && npm run build
```

说明：
- `frontend/dist` 需要提交，`deno deploy` 上传时会跳过被 `.gitignore` 忽略的文件。
- 以上检查同样由 `.github/workflows/ci.yml` 在 push 与 PR 上执行，并额外校验提交的 `frontend/dist` 没有过期。

## 1.1 部署后确认线上版本

```bash
deno task deploy:check https://<你的应用域名>
```

通过 GitHub Actions 部署时，配置了 `DEPLOY_URL` 变量的话这一步会自动执行。

输出 `Match` 表示线上跑的就是当前工作区这份代码；`Mismatch` 说明还有未部署的改动。
`build-info.json` 由 `deno task deploy` 自动生成，需要随代码一起提交，否则线上会报告 `unknown`。

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
