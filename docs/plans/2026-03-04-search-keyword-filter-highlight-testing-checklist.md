# Search Keyword Rules Manual Testing Checklist

## Header Entry & Panel

- [ ] Open `/search`, confirm keyword rules entry appears next to locale toggle in header.
- [ ] Open non-search route (e.g. `/history`), confirm keyword rules entry is hidden.
- [ ] Click keyword rules button, confirm panel opens with blocked/highlight inputs.
- [ ] Click outside panel, confirm panel closes.
- [ ] Confirm labels/placeholders/hints are localized in current language.

## Input Parsing Behavior

- [ ] Enter blocked words with commas (e.g. `剧透, R18`) and confirm both terms are recognized.
- [ ] Enter highlight words with extra spaces (e.g. ` 甜 , 长篇 `) and confirm spaces are ignored.
- [ ] Enter duplicate words (e.g. `R18,R18`) and confirm no duplicate hit rendering.
- [ ] Enter empty separators (e.g. `a,,b`) and confirm empty term is ignored.

## Card Blocking Behavior

- [ ] Use blocked word matching card title/author/tag/description and confirm matching card is blurred.
- [ ] Confirm blocked card remains visible in grid (not removed).
- [ ] Confirm overlay shows `block reason prefix + matched blocked words`.
- [ ] Click blocked overlay once, confirm card content is revealed.
- [ ] Confirm reveal click does NOT open modal immediately.

## Modal Blocking Behavior

- [ ] Open a blocked novel modal from revealed card.
- [ ] Confirm modal content is blurred + masked with block reason and reveal hint.
- [ ] Click modal overlay reveal, confirm content is unblurred without closing modal.
- [ ] Confirm read-now buttons and long-press context menu still function after reveal.

## Highlight Behavior (Card + Modal)

- [ ] Add highlight word that matches card title text and confirm title highlight appears.
- [ ] Add highlight word matching author/series/tag/description and confirm inline highlight appears in each visible field.
- [ ] Add highlight word that only matches preview-only content and confirm card shows compact highlight badge.
- [ ] Open modal and confirm title/author/series/tags highlight renders.
- [ ] Confirm description remains sanitized HTML rendering (no unsafe injection) while other fields highlight correctly.

## Rule Interaction & Reset

- [ ] Reveal a blocked card, then change blocked/highlight input.
- [ ] Confirm previously revealed card returns to blocked state when it still matches new rules.
- [ ] Clear blocked/highlight inputs and confirm all cards display normal style.

## Existing Behavior Regression Checks

- [ ] Search request still works with query input + search button.
- [ ] Sort change still re-queries and updates ordering.
- [ ] Pagination still changes page and scrolls to top.
- [ ] Search history dropdown open/close/select/remove still works.
- [ ] Modal open/close still works for non-blocked cards.
- [ ] Author and series navigation from card and modal still works when not blocked.

## Localization Checks

- [ ] Switch to Chinese locale and verify keyword rule text labels are Chinese.
- [ ] Switch to Japanese locale and verify keyword rule text labels are Japanese.
- [ ] Confirm blocked/reveal overlay text is localized in both locales.
