import { describe, expect, it, vi } from 'vitest'
import {
  changeSelectValue,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import SortControls from './SortControls'

const translations: Record<string, string> = {
  'sort.title': '排序方式',
  'sort.date_desc': '最新发布',
  'sort.date_asc': '最早发布',
  'sort.popular_desc': '最受欢迎',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    sortLabel: (value: string) => translations[`sort.${value}`] ?? value,
  }),
}))

describe('SortControls', () => {
  it('uses one compact native select on mobile and forwards changes', () => {
    const onChange = vi.fn()
    const { container, unmount } = renderReactElement(
      <SortControls value="date_desc" onChange={onChange} />,
    )
    const select = getElementBySelector(
      container,
      'select[data-mobile-sort]',
      HTMLSelectElement,
      'Mobile sort select',
    )

    expect(select.value).toBe('date_desc')
    expect(select.className).toContain('md:hidden')

    changeSelectValue(select, 'popular_desc')
    expect(onChange).toHaveBeenCalledWith('popular_desc')

    unmount()
  })

  it('keeps the three explicit sort buttons for desktop', () => {
    const { container, unmount } = renderReactElement(
      <SortControls value="date_asc" onChange={vi.fn()} />,
    )
    const desktopControls = getElementBySelector(
      container,
      '[data-desktop-sort]',
      HTMLElement,
      'Desktop sort controls',
    )

    expect(desktopControls.className).toContain('hidden')
    expect(desktopControls.className).toContain('md:flex')
    expect(desktopControls.querySelectorAll('button')).toHaveLength(3)

    unmount()
  })
})
