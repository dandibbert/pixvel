import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changeInputValue,
  changeSelectValue,
  getElementBySelector,
  getElementsBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import FilterRangeSection from './FilterRangeSection'

const translations: Record<string, string> = {
  'filter.publishDateRange': '发布时间范围',
  'filter.dateStart': '开始日期',
  'filter.dateEnd': '结束日期',
  'filter.bookmarkMin': '收藏下限',
  'filter.bookmarkMax': '收藏上限',
  'filter.textLengthMin': '字数下限',
  'filter.lang': '返回语言',
  'filter.noLimit': '不限制',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}))

function renderFilterRangeSection() {
  const onStartDateChange = vi.fn()
  const onEndDateChange = vi.fn()
  const onBookmarkNumChange = vi.fn()
  const onBookmarkNumMinChange = vi.fn()
  const onBookmarkNumMaxChange = vi.fn()
  const onTextLengthMinChange = vi.fn()
  const onLangChange = vi.fn()

  return {
    ...renderReactElement(
      <FilterRangeSection
        startDate="2025-04-26"
        endDate="2026-04-26"
        bookmarkNum={0}
        bookmarkNumMin={1000}
        bookmarkNumMax={4999}
        textLengthMin={3000}
        lang="ja"
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onBookmarkNumChange={onBookmarkNumChange}
        onBookmarkNumMinChange={onBookmarkNumMinChange}
        onBookmarkNumMaxChange={onBookmarkNumMaxChange}
        onTextLengthMinChange={onTextLengthMinChange}
        onLangChange={onLangChange}
      />,
    ),
    onStartDateChange,
    onEndDateChange,
    onBookmarkNumChange,
    onBookmarkNumMinChange,
    onBookmarkNumMaxChange,
    onTextLengthMinChange,
    onLangChange,
  }
}

describe('FilterRangeSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders controlled date, number, and language inputs', () => {
    const { container, unmount } = renderFilterRangeSection()
    const dateInputs = getElementsBySelector(container, 'input[type="date"]', HTMLInputElement, 'Date inputs')
    const numberInputs = getElementsBySelector(container, 'input[type="number"]', HTMLInputElement, 'Number inputs')
    const languageSelect = getElementBySelector(container, 'select', HTMLSelectElement, 'Language select')

    expect(container.textContent).toContain('发布时间范围')
    expect(dateInputs.map((input) => input.value)).toEqual(['2025-04-26', '2026-04-26'])
    expect(numberInputs.map((input) => input.value)).toEqual(['1000', '4999', '3000'])
    expect(languageSelect.value).toBe('ja')

    unmount()
  })

  it('forwards date input events for native date picker resets', () => {
    const { container, unmount, onStartDateChange, onEndDateChange } = renderFilterRangeSection()
    const dateInputs = getElementsBySelector(container, 'input[type="date"]', HTMLInputElement, 'Date inputs')

    changeInputValue(dateInputs[0], '')
    changeInputValue(dateInputs[1], '')

    expect(onStartDateChange).toHaveBeenCalledWith('')
    expect(onEndDateChange).toHaveBeenCalledWith('')

    unmount()
  })

  it('parses numeric fields and keeps legacy bookmark minimum synchronized', () => {
    const {
      container,
      unmount,
      onBookmarkNumChange,
      onBookmarkNumMinChange,
      onBookmarkNumMaxChange,
      onTextLengthMinChange,
    } = renderFilterRangeSection()
    const numberInputs = getElementsBySelector(container, 'input[type="number"]', HTMLInputElement, 'Number inputs')

    changeInputValue(numberInputs[0], '2500')
    changeInputValue(numberInputs[1], 'bad')
    changeInputValue(numberInputs[2], '8000')

    expect(onBookmarkNumMinChange).toHaveBeenCalledWith(2500)
    expect(onBookmarkNumChange).toHaveBeenCalledWith(2500)
    expect(onBookmarkNumMaxChange).toHaveBeenCalledWith(0)
    expect(onTextLengthMinChange).toHaveBeenCalledWith(8000)

    unmount()
  })

  it('forwards language changes as search language values', () => {
    const { container, unmount, onLangChange } = renderFilterRangeSection()
    const languageSelect = getElementBySelector(container, 'select', HTMLSelectElement, 'Language select')

    changeSelectValue(languageSelect, 'zh-CN')

    expect(onLangChange).toHaveBeenCalledWith('zh-CN')

    unmount()
  })
})
