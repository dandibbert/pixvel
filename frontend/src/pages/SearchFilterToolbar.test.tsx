import { describe, expect, it, vi } from 'vitest'
import { clickButtonByText, renderReactElement } from '../test/domTestUtils'
import type { SearchFilterState } from './searchPageModel'

type MockFilterPanelProps = {
  searchTarget: SearchFilterState['searchTarget']
  startDate: string
  endDate: string
  bookmarkNum: number
  bookmarkNumMin: number
  bookmarkNumMax: number
  textLengthMin: number
  lang: SearchFilterState['lang']
  includePotentialViolationWorks: boolean
  includeTranslatedTagResults: boolean
  isOriginalOnly: boolean
  isReplaceableOnly: boolean
  mergePlainKeywordResults: boolean
  searchAiType: SearchFilterState['searchAiType']
  onSearchTargetChange: (value: SearchFilterState['searchTarget']) => void
  onApply: () => void
}

type MockSortControlsProps = {
  value: 'date_desc' | 'date_asc' | 'popular_desc'
  onChange: (value: 'date_desc' | 'date_asc' | 'popular_desc') => void
}

const mockFilterPanelProps: MockFilterPanelProps[] = []
const mockSortControlsProps: MockSortControlsProps[] = []

vi.mock('../components/search/FilterPanel', () => ({
  default: (props: MockFilterPanelProps) => {
    mockFilterPanelProps.push(props)

    return (
      <button type="button" onClick={() => props.onSearchTargetChange('text')}>
        apply filter panel
      </button>
    )
  },
}))

vi.mock('../components/search/SortControls', () => ({
  default: (props: MockSortControlsProps) => {
    mockSortControlsProps.push(props)

    return (
      <button type="button" onClick={() => props.onChange('popular_desc')}>
        change sort
      </button>
    )
  },
}))

vi.mock('../components/search/SearchKeywordRulesControl', () => ({
  default: () => <div data-testid="search-keyword-rules-control">keyword rules</div>,
}))

const { default: SearchFilterToolbar } = await import('./SearchFilterToolbar')

function renderSearchFilterToolbar(element: React.ReactElement) {
  return renderReactElement(element)
}

const filters: SearchFilterState = {
  searchTarget: 'keyword',
  startDate: undefined,
  endDate: '2026-04-26',
  bookmarkNum: 0,
  bookmarkNumMin: 1000,
  bookmarkNumMax: 4999,
  textLengthMin: 3000,
  lang: 'zh-CN',
  includePotentialViolationWorks: true,
  includeTranslatedTagResults: false,
  isOriginalOnly: true,
  isReplaceableOnly: false,
  mergePlainKeywordResults: false,
  searchAiType: '0',
}

describe('SearchFilterToolbar', () => {
  it('forwards filter values and sort changes through a narrow page-level boundary', () => {
    mockFilterPanelProps.length = 0
    mockSortControlsProps.length = 0
    const onFilterChange = vi.fn()
    const onApplyFilters = vi.fn()
    const onSortChange = vi.fn()
    const { container, unmount } = renderSearchFilterToolbar(
      <SearchFilterToolbar
        filters={filters}
        sort="date_asc"
        onFilterChange={onFilterChange}
        onApplyFilters={onApplyFilters}
        onSortChange={onSortChange}
      />,
    )

    expect(mockFilterPanelProps[0]).toMatchObject({
      searchTarget: 'keyword',
      startDate: '',
      endDate: '2026-04-26',
      bookmarkNumMin: 1000,
      bookmarkNumMax: 4999,
      lang: 'zh-CN',
      searchAiType: '0',
    })
    expect(mockSortControlsProps[0].value).toBe('date_asc')
    expect(container.querySelector('[data-testid="search-keyword-rules-control"]')).toBeInstanceOf(HTMLElement)
    expect(container.firstElementChild?.className).toContain('flex-wrap')
    expect(container.firstElementChild?.className).not.toContain('flex-col')

    clickButtonByText(container, 'apply filter panel')
    clickButtonByText(container, 'change sort')
    mockFilterPanelProps[0].onApply()

    expect(onFilterChange).toHaveBeenCalledWith('searchTarget', 'text')
    expect(onSortChange).toHaveBeenCalledWith('popular_desc')
    expect(onApplyFilters).toHaveBeenCalledTimes(1)

    unmount()
  })
})
