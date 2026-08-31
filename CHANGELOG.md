# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Security
- Updated DOMPurify to 3.4.14 to address known XSS sanitization bypasses.
- Updated React Router to 7.18.3 to address known open redirect and hydration deserialization issues.

### Changed
- Raised the frontend build requirement to Node.js 20 or newer for React Router 7.
- Search pages now render every novel returned by the current API page immediately instead of revealing results ten at a time.
- Author works now use numbered, URL-backed pagination with a bounded local cache, so refreshes restore the current page without refetching fresh cached data.

### Fixed
- Reader page layout: when a page has very little text, bottom page navigation no longer floats upward; it stays at the viewport bottom.
- Reader pagination: page switch now consistently scrolls back to top after page state changes.
- Backend pre-release blockers:
  - fixed static file response typing in `src/index.ts`.
  - fixed bookmark response type mismatch in `src/routes/bookmarks.ts`.
  - fixed series fetch inference issue in `src/routes/novels.ts`.
  - fixed md5 helper type issue in `src/utils/md5.ts`.
  - preserved validated author and series IDs in list route requests, with regression coverage.
