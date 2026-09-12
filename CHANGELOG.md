# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Security
- Updated DOMPurify to 3.4.14 to address known XSS sanitization bypasses.
- Updated React Router to 7.18.3 to address known open redirect and hydration deserialization issues.

### Added
- `GET /api/version` reports the commit, branch and deployed-file fingerprint of the running deployment, and `GET /api/health` now includes the same revision as `version`.
- `deno task deploy:check <url>` compares a live deployment with the local working tree and exits non-zero when they differ; `deno task deploy` records the metadata in `build-info.json` before uploading.

### Changed
- Raised the frontend build requirement to Node.js 20 or newer for React Router 7.
- Search pages now render every novel returned by the current API page immediately instead of revealing results ten at a time.
- Author works now use numbered, URL-backed pagination with a bounded local cache, so refreshes restore the current page without refetching fresh cached data.

### Fixed
- Deno Deploy uploads now include `frontend/dist`; frontend exclusions are scoped to formatter and linter configuration instead of excluding the directory from deployment.
- Reader page layout: when a page has very little text, bottom page navigation no longer floats upward; it stays at the viewport bottom.
- Reader pagination: page switch now consistently scrolls back to top after page state changes.
- Backend pre-release blockers:
  - fixed static file response typing in `src/index.ts`.
  - fixed bookmark response type mismatch in `src/routes/bookmarks.ts`.
  - fixed series fetch inference issue in `src/routes/novels.ts`.
  - fixed md5 helper type issue in `src/utils/md5.ts`.
  - preserved validated author and series IDs in list route requests, with regression coverage.
