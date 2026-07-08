import { describe, expect, it, vi } from 'vitest'
import {
  changeInputValue,
  clickElement,
  getButtonByLabel,
  renderReactElement,
} from '../../test/domTestUtils'
import { HeaderKeywordRulesControl } from './HeaderKeywordRulesControl'

const translations: Record<string, string> = {
  'header.rulesCompact': 'ルール',
  'search.keywordRules.button': 'キーワードルール',
  'search.keywordRules.blockedLabel': '除外キーワード',
  'search.keywordRules.blockedPlaceholder': '例：ネタバレ, R18',
  'search.keywordRules.highlightLabel': 'ハイライトキーワード',
  'search.keywordRules.highlightPlaceholder': '例：甘い, 長編',
  'search.keywordRules.hint': '複数のキーワードはカンマ区切りで入力してください。',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}))

function renderControl(overrides: Partial<Parameters<typeof HeaderKeywordRulesControl>[0]> = {}) {
  return renderReactElement(
    <HeaderKeywordRulesControl
      panelId="rules-panel"
      isOpen={false}
      ruleCount={2}
      blockedWordsInput="ネタバレ"
      highlightWordsInput="甘い"
      onToggle={vi.fn()}
      onBlockedWordsInputChange={vi.fn()}
      onHighlightWordsInputChange={vi.fn()}
      {...overrides}
    />,
  )
}

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

describe('HeaderKeywordRulesControl', () => {
  it('renders the compact rules button with count and accessibility state', () => {
    const onToggle = vi.fn()
    const { container, unmount } = renderControl({ onToggle })

    const button = getButtonByLabel(container, 'キーワードルール')

    expect(button.getAttribute('aria-controls')).toBe('rules-panel')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.textContent?.replace(/\s+/g, '')).toBe('ルール2')
    expect(button.title).toBe('キーワードルール')
    expect(container.querySelector('#rules-panel')).toBeNull()

    clickElement(button)

    expect(onToggle).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('renders the open rules panel and forwards input changes', () => {
    const onBlockedWordsInputChange = vi.fn()
    const onHighlightWordsInputChange = vi.fn()
    const { container, unmount } = renderControl({
      isOpen: true,
      onBlockedWordsInputChange,
      onHighlightWordsInputChange,
    })

    const dialog = container.querySelector('#rules-panel')
    const blockedInput = getInputByLabel(container, '除外キーワード')
    const highlightInput = getInputByLabel(container, 'ハイライトキーワード')

    expect(dialog?.getAttribute('role')).toBe('dialog')
    expect(dialog?.getAttribute('aria-label')).toBe('キーワードルール')
    expect(blockedInput.value).toBe('ネタバレ')
    expect(blockedInput.placeholder).toBe('例：ネタバレ, R18')
    expect(highlightInput.value).toBe('甘い')
    expect(highlightInput.placeholder).toBe('例：甘い, 長編')
    expect(container.textContent).toContain('複数のキーワードはカンマ区切りで入力してください。')

    changeInputValue(blockedInput, 'R18')
    changeInputValue(highlightInput, '長編')

    expect(onBlockedWordsInputChange).toHaveBeenCalledWith('R18')
    expect(onHighlightWordsInputChange).toHaveBeenCalledWith('長編')

    unmount()
  })
})
