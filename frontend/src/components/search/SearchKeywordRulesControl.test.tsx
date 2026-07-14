import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changeInputValue,
  clickButtonByLabel,
  clickElement,
  getButtonByLabel,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import SearchKeywordRulesControl from './SearchKeywordRulesControl'

const setBlockedWordsInput = vi.fn()
const setHighlightWordsInput = vi.fn()

const translations: Record<string, string> = {
  'search.keywordRules.button': '关键词规则',
  'search.keywordRules.activeSuffix': '条规则正在影响搜索结果',
  'search.keywordRules.blockedLabel': '屏蔽关键词',
  'search.keywordRules.blockedPlaceholder': '例如：剧透, R18',
  'search.keywordRules.highlightLabel': '高亮关键词',
  'search.keywordRules.highlightPlaceholder': '例如：甜, 长篇',
  'search.keywordRules.hint': '多个关键词请用逗号分隔。',
  'search.keywordRules.close': '关闭关键词规则',
  'search.keywordRules.done': '完成',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}))

vi.mock('../../contexts/SearchKeywordRulesContext', () => ({
  useSearchKeywordRules: () => ({
    blockedWordsInput: '剧透, R18',
    highlightWordsInput: '甜, 长篇',
    blockedWords: ['剧透', 'R18'],
    highlightWords: ['甜', '长篇'],
    revealedBlockedIds: new Set<string>(),
    setBlockedWordsInput,
    setHighlightWordsInput,
    revealBlockedId: vi.fn(),
    resetRevealedBlockedIds: vi.fn(),
  }),
}))

function getInputByLabel(container: ParentNode, label: string) {
  const labelElement = Array.from(container.querySelectorAll('label')).find((element) =>
    (element.textContent ?? '').includes(label)
  )
  const input = labelElement?.querySelector('input')

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Input for "${label}" was not found`)
  }

  return input
}

describe('SearchKeywordRulesControl', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setBlockedWordsInput.mockReset()
    setHighlightWordsInput.mockReset()
  })

  it('renders a visible search-toolbar trigger with the active rule count', () => {
    const { container, unmount } = renderReactElement(<SearchKeywordRulesControl />)
    const trigger = getButtonByLabel(container, '关键词规则')

    expect(trigger.textContent?.replace(/\s+/g, '')).toBe('关键词规则4')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')

    unmount()
  })

  it('opens a mobile-safe bottom sheet and forwards rule edits', () => {
    const { container, unmount } = renderReactElement(<SearchKeywordRulesControl />)

    clickButtonByLabel(container, '关键词规则')

    const overlay = getElementBySelector(
      container,
      '[data-testid="keyword-rules-overlay"]',
      HTMLElement,
      'Keyword rules overlay',
    )
    const dialog = getElementBySelector(
      container,
      '[role="dialog"]',
      HTMLElement,
      'Keyword rules dialog',
    )
    const blockedInput = getInputByLabel(container, '屏蔽关键词')
    const highlightInput = getInputByLabel(container, '高亮关键词')

    expect(overlay.className).toContain('fixed')
    expect(overlay.className).toContain('items-end')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(container.textContent).toContain('4 条规则正在影响搜索结果')
    expect(blockedInput.value).toBe('剧透, R18')
    expect(highlightInput.value).toBe('甜, 长篇')

    changeInputValue(blockedInput, 'R18')
    changeInputValue(highlightInput, '长篇')

    expect(setBlockedWordsInput).toHaveBeenCalledWith('R18')
    expect(setHighlightWordsInput).toHaveBeenCalledWith('长篇')

    unmount()
  })

  it('closes on Escape and restores focus to the trigger', () => {
    const { container, unmount } = renderReactElement(<SearchKeywordRulesControl />)
    const trigger = getButtonByLabel(container, '关键词规则')

    clickElement(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)

    unmount()
  })
})
