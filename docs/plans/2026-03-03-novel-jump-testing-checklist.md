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
