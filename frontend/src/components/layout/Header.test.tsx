import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAnchorByHref,
  getButtonByLabel,
  renderReactElement,
  type RenderedReactElement,
} from '../../test/domTestUtils'
import Header from './Header'

const mockToggleLocale = vi.fn()
const mountedHeaders: RenderedReactElement[] = []

const translations: Record<string, string> = {
  'header.search': '検索',
  'header.history': '履歴',
  'header.toggleLocale': '言語を切り替え',
  'header.rulesCompact': 'ルール',
  'search.keywordRules.button': 'キーワードルール',
  'search.keywordRules.blockedLabel': '除外キーワード',
  'search.keywordRules.blockedPlaceholder': '例：ネタバレ, R18',
  'search.keywordRules.highlightLabel': 'ハイライトキーワード',
  'search.keywordRules.highlightPlaceholder': '例：甘い, 長編',
  'search.keywordRules.hint': '複数のキーワードはカンマ区切りで入力してください。',
}

vi.mock('../../stores/localeStore', () => ({
  useLocaleStore: (selector: (state: { toggleLocale: () => void }) => unknown) =>
    selector({ toggleLocale: mockToggleLocale }),
}))

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    locale: 'ja',
    t: (key: string) => translations[key] ?? key,
  }),
}))

vi.mock('../../contexts/SearchKeywordRulesContext', () => ({
  useSearchKeywordRules: () => ({
    blockedWordsInput: '',
    highlightWordsInput: '',
    blockedWords: ['ネタバレ'],
    highlightWords: ['甘い'],
    revealedBlockedIds: new Set<string>(),
    setBlockedWordsInput: vi.fn(),
    setHighlightWordsInput: vi.fn(),
    revealBlockedId: vi.fn(),
    resetRevealedBlockedIds: vi.fn(),
  }),
}))

function renderHeader(initialEntry: string) {
  const rendered = renderReactElement(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Header />
    </MemoryRouter>,
  )

  mountedHeaders.push(rendered)

  return rendered
}

function cleanupMountedHeaders() {
  while (mountedHeaders.length > 0) {
    const mountedHeader = mountedHeaders.pop()

    if (!mountedHeader) {
      continue
    }

    mountedHeader.unmount()
  }
}

function unmount(rendered: RenderedReactElement) {
  const mountedHeaderIndex = mountedHeaders.findIndex(
    (mountedHeader) => mountedHeader.root === rendered.root && mountedHeader.container === rendered.container,
  )

  if (mountedHeaderIndex >= 0) {
    mountedHeaders.splice(mountedHeaderIndex, 1)
  }

  rendered.unmount()
}

describe('Header', () => {
  beforeEach(() => {
    mockToggleLocale.mockReset()
    cleanupMountedHeaders()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanupMountedHeaders()
    document.body.innerHTML = ''
  })

  it('keeps route navigation in the header without duplicating search keyword rules', () => {
    const rendered = renderHeader('/search')
    const { container } = rendered

    const searchLink = getAnchorByHref(container, '/search')
    const historyLink = getAnchorByHref(container, '/history')
    expect(searchLink.getAttribute('aria-current')).toBe('page')
    expect(historyLink.hasAttribute('aria-current')).toBe(false)
    expect(container.querySelector('button[aria-label="キーワードルール"]')).toBeNull()

    unmount(rendered)
  })

  it('does not render the rules chip outside the search route and marks history as current on /history', () => {
    const rendered = renderHeader('/history')
    const { container } = rendered

    const searchLink = getAnchorByHref(container, '/search')
    const historyLink = getAnchorByHref(container, '/history')

    expect(searchLink.hasAttribute('aria-current')).toBe(false)
    expect(historyLink.getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('button[aria-label="キーワードルール"]')).toBeNull()

    unmount(rendered)
  })

  it('keeps the locale control available on the search route', () => {
    const rendered = renderHeader('/search')
    const { container } = rendered

    expect(getButtonByLabel(container, '言語を切り替え')).toBeInstanceOf(HTMLButtonElement)

    unmount(rendered)
  })
})
