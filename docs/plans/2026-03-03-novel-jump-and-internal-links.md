# Novel Jump and Internal Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable `[jump:数字]` page navigation and internal Pixiv novel link routing in novel reader content.

**Architecture:** Extend novelTextParser to recognize jump tokens, add callback prop to NovelContent for page navigation, intercept Pixiv URLs in link rendering to route internally.

**Tech Stack:** TypeScript, React, React Router

---

## Task 1: Extend Parser to Support Jump Tokens

**Files:**
- Modify: `frontend/src/utils/novelTextParser.ts:1-12,22-71`

**Step 1: Add jump type to ParsedElement interface**

```typescript
export interface ParsedElement {
  type: 'text' | 'chapter' | 'image' | 'ruby' | 'link' | 'jump'
  content: string
  metadata?: {
    imageId?: string
    rubyBase?: string
    rubyText?: string
    linkUrl?: string
    linkText?: string
    jumpPage?: number
  }
}
```

**Step 2: Add jump pattern to parseNovelText patterns array**

Insert after the `jumpuri` pattern (around line 62):

```typescript
{
  regex: /\[jump:(\d+)\]/,
  type: 'jump' as const,
  handler: (match: RegExpMatchArray) => ({
    type: 'jump' as const,
    content: '',
    metadata: { jumpPage: parseInt(match[1], 10) },
  }),
},
```

**Step 3: Verify TypeScript compilation**

Run: `npm --prefix frontend run build`
Expected: Build succeeds with no type errors

**Step 4: Commit parser changes**

```bash
git add frontend/src/utils/novelTextParser.ts
git commit -m "feat(parser): add jump token parsing for [jump:数字]"
```

---

## Task 2: Add Jump Rendering to NovelContent

**Files:**
- Modify: `frontend/src/components/novel/NovelContent.tsx:1-64`

**Step 1: Add onJumpToPage prop to interface**

```typescript
interface NovelContentProps {
  content: string
  onJumpToPage?: (page: number) => void
}
```

**Step 2: Add jump case to renderElement switch**

Insert after the `link` case (around line 43):

```typescript
case 'jump':
  if (!onJumpToPage || !element.metadata?.jumpPage) {
    return <span key={index}>[jump:{element.metadata?.jumpPage}]</span>
  }
  return (
    <button
      key={index}
      type="button"
      onClick={() => onJumpToPage(element.metadata!.jumpPage!)}
      className="text-pixiv-blue underline hover:text-blue-600 cursor-pointer bg-transparent border-none p-0 font-inherit"
    >
      [jump:{element.metadata.jumpPage}]
    </button>
  )
```

**Step 3: Update NovelContent function signature**

```typescript
export default function NovelContent({ content, onJumpToPage }: NovelContentProps) {
```

**Step 4: Verify TypeScript compilation**

Run: `npm --prefix frontend run build`
Expected: Build succeeds with no type errors

**Step 5: Commit jump rendering**

```bash
git add frontend/src/components/novel/NovelContent.tsx
git commit -m "feat(reader): add jump button rendering with page navigation"
```

---

## Task 3: Wire Jump Callback from NovelReader

**Files:**
- Modify: `frontend/src/components/novel/NovelReader.tsx:84-98`

**Step 1: Pass goToPage to NovelContent**

Update the NovelContent component call (around line 97):

```typescript
<NovelContent
  content={currentPageContent}
  onJumpToPage={goToPage}
/>
```

**Step 2: Verify TypeScript compilation**

Run: `npm --prefix frontend run build`
Expected: Build succeeds with no type errors

**Step 3: Commit reader integration**

```bash
git add frontend/src/components/novel/NovelReader.tsx
git commit -m "feat(reader): wire jump navigation to pagination hook"
```

---

## Task 4: Add Pixiv URL Interception to Link Rendering

**Files:**
- Modify: `frontend/src/components/novel/NovelContent.tsx:32-43`

**Step 1: Create helper function to extract Pixiv novel ID**

Add before the NovelContent component (around line 7):

```typescript
function extractPixivNovelId(url: string): string | null {
  if (!url) return null

  // Match pixiv.net/novel/show.php?id=123456
  const legacyMatch = url.match(/pixiv\.net\/novel\/show\.php\?id=(\d+)/)
  if (legacyMatch) return legacyMatch[1]

  // Match pixiv.net/novel/123456 or pixiv.net/en/novel/123456
  const modernMatch = url.match(/pixiv\.net\/(?:[a-z]{2}\/)?novel\/(\d+)/)
  if (modernMatch) return modernMatch[1]

  return null
}
```

**Step 2: Update link rendering to intercept Pixiv URLs**

Replace the existing `link` case:

```typescript
case 'link': {
  const novelId = extractPixivNovelId(element.metadata?.linkUrl || '')

  if (novelId) {
    return (
      <a
        key={index}
        href={element.metadata?.linkUrl}
        onClick={(e) => {
          e.preventDefault()
          window.open(`/novel/${novelId}`, '_blank', 'noopener,noreferrer')
        }}
        className="text-pixiv-blue underline hover:text-blue-600 break-words cursor-pointer"
      >
        {element.metadata?.linkText}
      </a>
    )
  }

  return (
    <a
      key={index}
      href={element.metadata?.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-pixiv-blue underline hover:text-blue-600 break-words"
    >
      {element.metadata?.linkText}
    </a>
  )
}
```

**Step 3: Verify TypeScript compilation**

Run: `npm --prefix frontend run build`
Expected: Build succeeds with no type errors

**Step 4: Commit link interception**

```bash
git add frontend/src/components/novel/NovelContent.tsx
git commit -m "feat(reader): intercept Pixiv novel links for internal routing"
```

---

## Task 5: Final Build Verification

**Step 1: Clean build**

Run: `npm --prefix frontend run build`
Expected: Build succeeds, outputs dist files

**Step 2: Verify dist output**

Run: `ls -lh frontend/dist/assets/`
Expected: New JS/CSS bundle files present

**Step 3: Create manual testing checklist**

Create file: `docs/plans/2026-03-03-novel-jump-testing-checklist.md`

```markdown
# Novel Jump and Internal Links Testing Checklist

## Jump Navigation Tests

- [ ] Open a novel with `[jump:2]` in content
- [ ] Verify `[jump:2]` renders as blue underlined clickable text
- [ ] Click jump link
- [ ] Verify page changes to page 2 without full reload
- [ ] Verify URL updates to include `?page=2`
- [ ] Test jump to first page `[jump:1]`
- [ ] Test jump to last page
- [ ] Test invalid jump `[jump:999]` (should be handled by goToPage boundary check)

## Internal Link Tests

- [ ] Open novel with Pixiv novel link (format: `https://www.pixiv.net/novel/show.php?id=123456`)
- [ ] Click link
- [ ] Verify new tab opens with `/novel/123456` route
- [ ] Test modern URL format: `https://www.pixiv.net/novel/123456`
- [ ] Test localized URL: `https://www.pixiv.net/en/novel/123456`
- [ ] Verify all formats open in new tab within app

## External Link Tests

- [ ] Open novel with non-Pixiv link (e.g., `https://example.com`)
- [ ] Click link
- [ ] Verify opens in new tab to external site
- [ ] Verify `noopener,noreferrer` attributes present

## Edge Cases

- [ ] Novel with no jumps or links renders normally
- [ ] Mixed content (text + jump + link + ruby) renders correctly
- [ ] Jump with invalid format `[jump:abc]` displays as plain text
- [ ] Multiple jumps on same page all work independently
```

**Step 4: Commit testing checklist**

```bash
git add docs/plans/2026-03-03-novel-jump-testing-checklist.md
git commit -m "docs: add manual testing checklist for jump and links"
```

---

## Manual Testing Instructions

After deployment:

1. Navigate to a novel reader page
2. Use browser DevTools to inspect rendered jump/link elements
3. Follow testing checklist in `docs/plans/2026-03-03-novel-jump-testing-checklist.md`
4. Verify console has no errors during navigation
5. Test on both desktop and mobile viewports

## Rollback Plan

If issues found:

```bash
git revert HEAD~4..HEAD
npm --prefix frontend run build
```

This reverts all 4 commits from this implementation.
