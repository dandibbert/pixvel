# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Security
- Updated DOMPurify to 3.4.14 to address known XSS sanitization bypasses.
- Updated React Router to 7.18.3 to address known open redirect and hydration deserialization issues.

### Added
- GitHub Actions workflows: `ci.yml` runs the backend and frontend checks (and fails when the committed `frontend/dist` is stale), and `deploy.yml` deploys `main` to Deno Deploy, then verifies the live `/api/version` matches what it uploaded.
- `GET /api/version` reports the commit, branch and deployed-file fingerprint of the running deployment, and `GET /api/health` now includes the same revision as `version`.
- `deno task deploy:check <url>` compares a live deployment with the local working tree and exits non-zero when they differ; `deno task deploy` records the metadata in `build-info.json` before uploading.

### Changed
- The Deploy org and app are no longer pinned in `deno.json`: both must come from `DENO_DEPLOY_ORG` / `DENO_DEPLOY_APP` (`.env.deploy` locally, repository variables in CI), and `scripts/publish.sh` reverts the values the deploy CLI writes back into `deno.json`.
- Raised the frontend build requirement to Node.js 20 or newer for React Router 7.
- Search pages now render every novel returned by the current API page immediately instead of revealing results ten at a time.
- Author works now use numbered, URL-backed pagination with a bounded local cache, so refreshes restore the current page without refetching fresh cached data.

### Fixed
- Deploying no longer fails on Deno 2.9.x, where the `deno deploy` subcommand forwards every flag twice and then rejects its own arguments; `scripts/publish.sh` detects this and runs the identical CLI from JSR instead.
- The frontend build no longer fails with `TS2550` on `Array.prototype.at` / `String.prototype.at`: the TypeScript target and lib are now ES2022, which also unblocks `deno task deploy`.
- Deno Deploy uploads now include `frontend/dist`; frontend exclusions are scoped to formatter and linter configuration instead of excluding the directory from deployment.
- Reader page layout: when a page has very little text, bottom page navigation no longer floats upward; it stays at the viewport bottom.
- Reader pagination: page switch now consistently scrolls back to top after page state changes.
- Backend pre-release blockers:
  - fixed static file response typing in `src/index.ts`.
  - fixed bookmark response type mismatch in `src/routes/bookmarks.ts`.
  - fixed series fetch inference issue in `src/routes/novels.ts`.
  - fixed md5 helper type issue in `src/utils/md5.ts`.
  - preserved validated author and series IDs in list route requests, with regression coverage.
