# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Reader page layout: when a page has very little text, bottom page navigation no longer floats upward; it stays at the viewport bottom.
- Reader pagination: page switch now consistently scrolls back to top after page state changes.
- Backend pre-release blockers:
  - fixed static file response typing in `src/index.ts`.
  - fixed bookmark response type mismatch in `src/routes/bookmarks.ts`.
  - fixed series fetch inference issue in `src/routes/novels.ts`.
  - fixed md5 helper type issue in `src/utils/md5.ts`.
