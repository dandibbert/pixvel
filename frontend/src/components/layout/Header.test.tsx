import { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const mockToggleLocale = vi.fn()
const mountedHeaders: Array<{ container: HTMLElement; root: Root }> = []

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
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  mountedHeaders.push({ container, root })

  act(() => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Header />
      </MemoryRouter>
    )
  })

  return { container, root }
}

function getLink(container: HTMLElement, href: string): HTMLAnchorElement {
  const link = container.querySelector(`a[href="${href}"]`)

  if (!(link instanceof HTMLAnchorElement)) {
    throw new Error(`Link for ${href} was not found`)
  }

  return link
}

function getRulesButton(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector('button[aria-label="キーワードルール"]')

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('Rules button was not found')
  }

  return button
}

function cleanupMountedHeaders() {
  while (mountedHeaders.length > 0) {
    const mountedHeader = mountedHeaders.pop()

    if (!mountedHeader) {
      continue
    }

    act(() => {
      mountedHeader.root.unmount()
    })
    mountedHeader.container.remove()
  }
}

function unmount(root: Root, container: HTMLElement) {
  const mountedHeaderIndex = mountedHeaders.findIndex(
    (mountedHeader) => mountedHeader.root === root && mountedHeader.container === container,
  )

  if (mountedHeaderIndex >= 0) {
    mountedHeaders.splice(mountedHeaderIndex, 1)
  }

  act(() => {
    root.unmount()
  })
  container.remove()
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

  it('renders the compact Japanese rules chip on the search route with the full aria-label preserved', () => {
    const { container, root } = renderHeader('/search')

    const searchLink = getLink(container, '/search')
    const historyLink = getLink(container, '/history')
    const rulesButton = getRulesButton(container)

    expect(searchLink.getAttribute('aria-current')).toBe('page')
    expect(historyLink.hasAttribute('aria-current')).toBe(false)
    expect(rulesButton.textContent?.replace(/\s+/g, '')).toBe('ルール2')
    expect(rulesButton.title).toBe('キーワードルール')
    expect(container.textContent).not.toContain('キーワードルール')

    unmount(root, container)
  })

  it('does not render the rules chip outside the search route and marks history as current on /history', () => {
    const { container, root } = renderHeader('/history')

    const searchLink = getLink(container, '/search')
    const historyLink = getLink(container, '/history')

    expect(searchLink.hasAttribute('aria-current')).toBe(false)
    expect(historyLink.getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('button[aria-label="キーワードルール"]')).toBeNull()

    unmount(root, container)
  })

  it('wires the rules button accessibility state and closes the panel on Escape', () => {
    const { container, root } = renderHeader('/search')

    const rulesButton = getRulesButton(container)

    expect(rulesButton.getAttribute('aria-controls')).toBe('header-keyword-rules-panel')
    expect(rulesButton.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('#header-keyword-rules-panel')).toBeNull()

    act(() => {
      rulesButton.click()
    })

    expect(rulesButton.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('#header-keyword-rules-panel')).not.toBeNull()
    expect(container.textContent).toContain('除外キーワード')
    expect(container.textContent).toContain('ハイライトキーワード')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(rulesButton.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('#header-keyword-rules-panel')).toBeNull()

    unmount(root, container)
  })
})
