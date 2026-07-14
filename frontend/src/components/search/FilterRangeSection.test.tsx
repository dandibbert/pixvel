import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  changeInputValue,
  changeSelectValue,
  clickButtonByLabel,
  clickButtonByText,
  getElementBySelector,
  getElementsBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import FilterRangeSection from './FilterRangeSection'

const translations: Record<string, string> = {
  'filter.publishDateRange': '发布时间范围',
  'filter.bookmarkRange': '书签数',
  'filter.dateStart': '开始日期',
  'filter.dateEnd': '结束日期',
  'filter.datePreset.anytime': '不限',
  'filter.datePreset.last7Days': '近 7 天',
  'filter.datePreset.last30Days': '近 30 天',
  'filter.datePreset.last180Days': '近半年',
  'filter.datePreset.last365Days': '近一年',
  'filter.bookmarkPreset.0': '不限',
  'filter.bookmarkPreset.100': '100+',
  'filter.bookmarkPreset.500': '500+',
  'filter.bookmarkPreset.1000': '1,000+',
  'filter.bookmarkPreset.5000': '5,000+',
  'filter.bookmarkPreset.10000': '10,000+',
  'filter.dateInputHint': '点按键盘输入',
  'filter.bookmarkInputHint': '点按键盘输入',
  'filter.openStartDateCalendar': '打开开始日期日历',
  'filter.openEndDateCalendar': '打开结束日期日历',
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
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 11))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders controlled direct date, bookmark, number, and language inputs', () => {
    const { container, unmount } = renderFilterRangeSection()
    const dateInputs = getElementsBySelector(
      container,
      'input[data-direct-date-input]',
      HTMLInputElement,
      'Direct date inputs',
    )
    const bookmarkInputs = getElementsBySelector(
      container,
      'input[data-bookmark-input]',
      HTMLInputElement,
      'Bookmark inputs',
    )
    const numberInputs = getElementsBySelector(
      container,
      'input[type="number"]',
      HTMLInputElement,
      'Number inputs',
    )
    const languageSelect = getElementBySelector(container, 'select', HTMLSelectElement, 'Language select')

    expect(container.textContent).toContain('发布时间范围')
    expect(container.textContent).toContain('书签数')
    expect(dateInputs.map((input) => input.type)).toEqual(['text', 'text'])
    expect(dateInputs.map((input) => input.inputMode)).toEqual(['numeric', 'numeric'])
    expect(dateInputs.map((input) => input.value)).toEqual(['2025/04/26', '2026/04/26'])
    expect(bookmarkInputs.map((input) => input.inputMode)).toEqual(['numeric', 'numeric'])
    expect(bookmarkInputs.map((input) => input.value)).toEqual(['1000', '4999'])
    expect(numberInputs.map((input) => input.value)).toEqual(['3000'])
    expect(languageSelect.value).toBe('ja')

    unmount()
  })

  it('stacks full date inputs on phone widths before restoring two columns', () => {
    const { container, unmount } = renderFilterRangeSection()
    const dateInputGrid = getElementBySelector(
      container,
      '[data-date-input-grid]',
      HTMLElement,
      'Direct date input grid',
    )

    expect(dateInputGrid.className).toContain('grid-cols-1')
    expect(dateInputGrid.className).toContain('sm:grid-cols-2')

    unmount()
  })

  it('uses a 16px phone font for directly keyboard-editable range inputs', () => {
    const { container, unmount } = renderFilterRangeSection()
    const directInputs = [
      ...getElementsBySelector(
        container,
        'input[data-direct-date-input]',
        HTMLInputElement,
        'Direct date inputs',
      ),
      ...getElementsBySelector(
        container,
        'input[data-bookmark-input]',
        HTMLInputElement,
        'Bookmark inputs',
      ),
    ]

    expect(directInputs.every((input) => input.className.includes('text-base'))).toBe(true)
    expect(directInputs.every((input) => input.className.includes('md:text-sm'))).toBe(true)

    unmount()
  })

  it('normalizes direct keyboard date input and forwards native calendar selections', () => {
    const { container, unmount, onStartDateChange, onEndDateChange } = renderFilterRangeSection()
    const directDateInputs = getElementsBySelector(
      container,
      'input[data-direct-date-input]',
      HTMLInputElement,
      'Direct date inputs',
    )
    const nativeDateInputs = getElementsBySelector(
      container,
      'input[data-native-date-input]',
      HTMLInputElement,
      'Native date inputs',
    )

    changeInputValue(directDateInputs[0], '2026061')
    changeInputValue(nativeDateInputs[1], '2026-07-11')

    expect(onStartDateChange).toHaveBeenCalledWith('2026-06-1')
    expect(onEndDateChange).toHaveBeenCalledWith('2026-07-11')

    unmount()
  })

  it('applies date and bookmark presets without removing direct input', () => {
    const {
      container,
      unmount,
      onStartDateChange,
      onEndDateChange,
      onBookmarkNumChange,
      onBookmarkNumMinChange,
      onBookmarkNumMaxChange,
    } = renderFilterRangeSection()

    clickButtonByText(container, '近 30 天')
    clickButtonByText(container, '1,000+')

    expect(onStartDateChange).toHaveBeenCalledWith('2026-06-12')
    expect(onEndDateChange).toHaveBeenCalledWith('2026-07-11')
    expect(onBookmarkNumMinChange).toHaveBeenCalledWith(1000)
    expect(onBookmarkNumChange).toHaveBeenCalledWith(1000)
    expect(onBookmarkNumMaxChange).toHaveBeenCalledWith(0)

    unmount()
  })

  it('parses direct bookmark and numeric fields while keeping the legacy minimum synchronized', () => {
    const {
      container,
      unmount,
      onBookmarkNumChange,
      onBookmarkNumMinChange,
      onBookmarkNumMaxChange,
      onTextLengthMinChange,
    } = renderFilterRangeSection()
    const bookmarkInputs = getElementsBySelector(
      container,
      'input[data-bookmark-input]',
      HTMLInputElement,
      'Bookmark inputs',
    )
    const numberInput = getElementBySelector(
      container,
      'input[type="number"]',
      HTMLInputElement,
      'Text length input',
    )

    changeInputValue(bookmarkInputs[0], '2,500')
    changeInputValue(bookmarkInputs[1], 'bad')
    changeInputValue(numberInput, '8000')

    expect(onBookmarkNumMinChange).toHaveBeenCalledWith(2500)
    expect(onBookmarkNumChange).toHaveBeenCalledWith(2500)
    expect(onBookmarkNumMaxChange).toHaveBeenCalledWith(0)
    expect(onTextLengthMinChange).toHaveBeenCalledWith(8000)

    unmount()
  })

  it('exposes separate calendar buttons for both date fields', () => {
    const { container, unmount } = renderFilterRangeSection()

    expect(() => clickButtonByLabel(container, '打开开始日期日历')).not.toThrow()
    expect(() => clickButtonByLabel(container, '打开结束日期日历')).not.toThrow()

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
