# Reader Modal Reuse Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reuse a shared novel detail content renderer between Reader and Search/List modals so description HTML and metadata display stay consistent.

**Architecture:** Extract the duplicated detail body UI into a single shared component under `frontend/src/components/novel/`, then wire both `NovelPreviewModal` and `NovelDetailModal` to consume it while keeping their own modal shells and page-specific actions. Use a strict minimal-diff approach: do not alter page routing flows or business logic beyond render reuse.

**Tech Stack:** React 18, TypeScript, Vite, TailwindCSS, ESLint

---

### Task 1: Add shared detail content component scaffold

**Files:**
- Create: `frontend/src/components/novel/NovelDetailContent.tsx`
- Reference: `frontend/src/components/novel/NovelPreviewModal.tsx:119-206`
- Reference: `frontend/src/components/novel/NovelDetailModal.tsx:37-90`

**Step 1: Write the failing test (build-level guard)**

Because this frontend currently has no test runner configured in `frontend/package.json`, use TypeScript compilation as the executable safety net for this change step.

Create the component file with an intentionally incomplete export first (or no props typing) so TypeScript check fails when imported in later steps.

**Step 2: Run command to verify failing state**

Run: `npm run build --prefix frontend`
Expected: FAIL with TypeScript error related to missing/incompatible `NovelDetailContent` export/props.

**Step 3: Write minimal implementation**

Implement `NovelDetailContent.tsx` with:
- `novel` prop typed as `Novel | NovelDetail`
- `locale`, `t`, `formatNumber` passthrough props (from existing i18n usage)
- `onNavigateAuthor?`, `onNavigateSeries?` callback props for shell-specific routing behavior
- Shared rendering blocks:
  - title
  - author + created date
  - optional series entry
  - stats row (bookmarks/views/pageCount)
  - tags
  - description section rendered with `dangerouslySetInnerHTML`

Preserve current UI semantics from `NovelPreviewModal` for content parity (spacing/classes can be equivalent, avoid cosmetic redesign).

**Step 4: Run command to verify pass**

Run: `npm run build --prefix frontend`
Expected: PASS for TypeScript compile regarding new component (other unrelated warnings may still appear as before).

**Step 5: Commit**

```bash
git add frontend/src/components/novel/NovelDetailContent.tsx
git commit -m "refactor: add shared novel detail content component"
```

---

### Task 2: Refactor `NovelPreviewModal` to use shared detail content

**Files:**
- Modify: `frontend/src/components/novel/NovelPreviewModal.tsx:119-206`
- Use: `frontend/src/components/novel/NovelDetailContent.tsx`
- Verify behavior in: `frontend/src/pages/SearchPage.tsx:313-317`
- Verify behavior in: `frontend/src/pages/ListPage.tsx:129-133`

**Step 1: Write the failing test (regression probe)**

Temporarily replace `NovelPreviewModal` detail body with placeholder (or remove old body and import before implementing shared usage) to force a compile/runtime mismatch and confirm the step is exercised.

**Step 2: Run command to verify failing state**

Run: `npm run build --prefix frontend`
Expected: FAIL with missing JSX/prop/import issue in `NovelPreviewModal.tsx`.

**Step 3: Write minimal implementation**

Refactor `NovelPreviewModal` to:
- Import and render `NovelDetailContent`
- Keep all modal shell, footer actions, long-press context menu, and button handlers unchanged
- Pass navigation callbacks so clicking author/series retains existing route behavior
- Keep close behavior identical after navigation actions

**Step 4: Run command to verify pass**

Run: `npm run build --prefix frontend`
Expected: PASS with unchanged Search/List preview modal behavior.

**Step 5: Commit**

```bash
git add frontend/src/components/novel/NovelPreviewModal.tsx frontend/src/components/novel/NovelDetailContent.tsx
git commit -m "refactor: reuse detail content in preview modal"
```

---

### Task 3: Refactor `NovelDetailModal` to use shared detail content

**Files:**
- Modify: `frontend/src/components/novel/NovelDetailModal.tsx:15-91`
- Use: `frontend/src/components/novel/NovelDetailContent.tsx`
- Verify trigger remains in: `frontend/src/components/novel/NovelReader.tsx:110-114`

**Step 1: Write the failing test (regression probe)**

Temporarily remove old inline detail body in `NovelDetailModal` before wiring shared component so compile fails and confirms this task delta is active.

**Step 2: Run command to verify failing state**

Run: `npm run build --prefix frontend`
Expected: FAIL with JSX/typing error in `NovelDetailModal.tsx` during transition.

**Step 3: Write minimal implementation**

Refactor `NovelDetailModal` to:
- Import and render `NovelDetailContent`
- Keep Reader modal shell (overlay/close header) intact
- Remove duplicated inline content blocks that now live in shared component
- Preserve open/close contract and click-to-close backdrop behavior

Note: Reader modal can omit navigation callbacks if not needed; if enabled, ensure callback behavior is explicit and unchanged from prior UX expectations.

**Step 4: Run command to verify pass**

Run: `npm run build --prefix frontend`
Expected: PASS with Reader modal now sharing the same content rendering path as Search/List.

**Step 5: Commit**

```bash
git add frontend/src/components/novel/NovelDetailModal.tsx frontend/src/components/novel/NovelDetailContent.tsx
git commit -m "refactor: reuse detail content in reader modal"
```

---

### Task 4: Verify behavior and quality gates

**Files:**
- Verify manually: `frontend/src/pages/ReaderPage.tsx`, `frontend/src/pages/SearchPage.tsx`, `frontend/src/pages/ListPage.tsx`
- Optional doc update: `docs/plans/2026-03-01-reader-modal-reuse-design.md` (if implementation differs)

**Step 1: Run full build/lint checks**

Run:
- `npm run build --prefix frontend`
- `npm run lint --prefix frontend`

Expected: PASS (or only pre-existing, unrelated issues documented explicitly).

**Step 2: Manual verification checklist**

Run app and validate:
1. Reader top-bar title opens modal; description renders HTML consistently with Search/List.
2. Search page preview modal behavior unchanged (including read buttons and long-press menu).
3. List page preview modal behavior unchanged.
4. Author/series navigation from preview modal still works and closes modal as before.
5. Tags/stats/date formatting parity remains consistent.

**Step 3: If manual verification finds mismatch, fix minimally and re-run checks**

Apply only scoped fixes to shared content props/rendering; avoid redesigning modal shells.

**Step 4: Final commit**

```bash
git add frontend/src/components/novel/NovelDetailContent.tsx frontend/src/components/novel/NovelPreviewModal.tsx frontend/src/components/novel/NovelDetailModal.tsx docs/plans/2026-03-01-reader-modal-reuse-design.md
git commit -m "fix(reader): unify detail modal content rendering across pages"
```

(Only include files actually changed; keep commit focused.)

---

## Notes for the implementer

- DRY/YAGNI: only extract currently duplicated detail-body concerns; do not abstract modal shells.
- Keep all existing route paths and user flows intact.
- Do not introduce new dependencies.
- If HTML safety policy is to be improved later, centralizing content in `NovelDetailContent` gives one place for that follow-up.
