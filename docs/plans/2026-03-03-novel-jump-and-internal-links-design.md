# Novel Jump and Internal Links Design

**Date**: 2026-03-03
**Status**: Approved

## Problem Statement

Two issues in novel reader content rendering:

1. `[jump:数字]` tags display as literal text instead of clickable page navigation
2. Pixiv novel links open on pixiv.net instead of within the web app

## Requirements

- Parse `[jump:数字]` tags and render as clickable elements that navigate to the specified page
- Intercept Pixiv novel URLs and open them in new tabs within the app (`/novel/:id`)
- Preserve external link behavior for non-Pixiv URLs
- Jump navigation should only change page within current reader, not modify URL

## Design

### Architecture

**Modified Components**:
- `frontend/src/utils/novelTextParser.ts`: Add `jump` token parsing
- `frontend/src/components/novel/NovelContent.tsx`:
  - Add `onJumpToPage` callback prop
  - Render `jump` as clickable link-styled text
  - Intercept Pixiv novel URLs in `link` rendering
- `frontend/src/components/novel/NovelReader.tsx`: Pass `goToPage` to `NovelContent`

**Data Flow**:
```
User clicks [jump:12]
  → NovelContent calls onJumpToPage(12)
  → NovelReader's goToPage(12)
  → useNovelPagination updates currentPage
  → Re-renders with new page content
```

### Component Interface

**ParsedElement Type Extension**:
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
    jumpPage?: number  // New field
  }
}
```

**NovelContent Props**:
```typescript
interface NovelContentProps {
  content: string
  onJumpToPage?: (page: number) => void  // New callback
}
```

### Rendering Logic

**Jump Rendering**:
- Style: Blue underlined text (consistent with links)
- Click behavior: Call `onJumpToPage(metadata.jumpPage)`
- Fallback: If `onJumpToPage` not provided, render as plain text

**Link Rendering**:
- Extract Pixiv novel ID using regex (supports both URL formats):
  - `pixiv.net/novel/show.php?id=123`
  - `pixiv.net/novel/123`
- If ID extracted successfully:
  - `onClick`: Prevent default, call `window.open('/novel/{id}', '_blank', 'noopener,noreferrer')`
- If extraction fails:
  - Keep original `href` with `target="_blank"` (external link)

### Error Handling

**Parser Layer**:
- `[jump:abc]` (non-numeric) → Treat as plain text, don't parse
- `[jump:0]` or `[jump:-1]` (invalid page) → Parse but disable click in renderer
- `[jump:999]` (exceeds total pages) → Parse, let `goToPage` handle boundary check

**Renderer Layer**:
- `onJumpToPage` not provided → Render jump as plain text (graceful degradation)
- Pixiv URL parse failure → Keep external link behavior
- Click during page load → No special handling (rely on existing pagination logic)

**User Experience**:
- Jump clicks navigate immediately without confirmation
- Internal novel links open in new tabs (user can close/switch freely)
- External links maintain `noopener,noreferrer` security attributes

### Testing Strategy

**Unit Tests** (novelTextParser):
- Parse `[jump:12]` correctly extracts page number
- Parse `[jump:abc]` doesn't match, treated as text
- Mixed content (text + jump + link + ruby) parses in correct order

**Integration Tests** (NovelContent):
- Jump renders as clickable element, triggers callback on click
- Pixiv novel links identified and converted to internal routes
- Non-Pixiv links maintain external behavior
- Jump degrades to text when `onJumpToPage` missing

**Manual Verification**:
- Click jump in actual novel content navigates to correct page
- Click internal novel link opens correct page in new tab
- External links open Pixiv official site normally

**Implementation Note**: Since project lacks test framework, will:
1. Implement feature code
2. Verify local build passes
3. Provide manual testing checklist

## Implementation Plan

See separate implementation plan document (to be created via writing-plans skill).

## Alternatives Considered

**Option 2 (Medium Complexity)**: Create standalone link/jump parsing + routing utility
- Pros: Better reusability
- Cons: Over-engineered for current requirements

**Option 3 (High Complexity)**: Convert content to HTML with event delegation
- Pros: More extensible
- Cons: Complex, harder XSS/event boundary control, not suitable for current needs

**Selected**: Option 1 (minimal changes, focused on requirements)
