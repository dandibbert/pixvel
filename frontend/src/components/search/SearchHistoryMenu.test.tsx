import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clickButtonByLabel,
  clickButtonContainingText,
  clickElement,
  getElementBySelector,
  renderReactElement,
} from '../../test/domTestUtils'
import type { SearchHistoryEntry } from '../../types/search'
import SearchHistoryMenu from './SearchHistoryMenu'

const translations: Record<string, string> = {
  'search.historyRecent': '最近搜索',
  'search.historyClear': '清空',
  'search.historyClose': '关闭',
  'search.historyBookmarkSuffix': '收藏',
  'search.target.keyword': '关键词',
  'sort.date_desc': '最新',
}

vi.mock('../../i18n/useI18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    formatNumber: (value: number) => value.toLocaleString('zh-CN'),
    searchTargetLabel: (target: string) => translations[`search.target.${target}`] ?? target,
    sortLabel: (sort: string) => translations[`sort.${sort}`] ?? sort,
  }),
}))

const historyEntry: SearchHistoryEntry = {
  query: '五悠',
  sort: 'date_desc',
  searchTarget: 'keyword',
  bookmarkNum: 1200,
  timestamp: 1,
}

function renderSearchHistoryMenu(props: Partial<React.ComponentProps<typeof SearchHistoryMenu>> = {}) {
  const onEntryClick = vi.fn()
  const onRemoveEntry = vi.fn()
  const onClear = vi.fn()
  const onClose = vi.fn()

  return {
    ...renderReactElement(
      <SearchHistoryMenu
        entries={[historyEntry]}
        onEntryClick={onEntryClick}
        onRemoveEntry={onRemoveEntry}
        onClear={onClear}
        onClose={onClose}
        {...props}
      />,
    ),
    onEntryClick,
    onRemoveEntry,
    onClear,
    onClose,
  }
}

describe('SearchHistoryMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders formatted history metadata and selects an entry', () => {
    const { container, unmount, onEntryClick } = renderSearchHistoryMenu()

    expect(container.textContent).toContain('最近搜索')
    expect(container.textContent).toContain('五悠')
    expect(container.textContent).toContain('关键词')
    expect(container.textContent).toContain('最新')
    expect(container.textContent).toContain('1,200+收藏')

    const entry = getElementBySelector(container, '[data-testid="search-history-entry"]', HTMLElement, 'Search history entry')

    clickElement(entry)

    expect(onEntryClick).toHaveBeenCalledWith(historyEntry)

    unmount()
  })

  it('removes an entry without selecting it', () => {
    const { container, unmount, onEntryClick, onRemoveEntry } = renderSearchHistoryMenu()

    clickButtonByLabel(container, '删除 五悠')

    expect(onRemoveEntry).toHaveBeenCalledWith(0)
    expect(onEntryClick).not.toHaveBeenCalled()

    unmount()
  })

  it('forwards clear and close actions', () => {
    const { container, unmount, onClear, onClose } = renderSearchHistoryMenu()

    clickButtonContainingText(container, '清空')
    clickButtonContainingText(container, '关闭')

    expect(onClear).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()

    unmount()
  })
})
