import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { getButtonByText, renderReactElement } from '../test/domTestUtils'
import type { SearchHistoryEntry } from '../types/search'

type MockSearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onFocus?: () => void
  maxLength?: number
}

type MockSearchHistoryMenuProps = {
  entries: ReadonlyArray<SearchHistoryEntry>
  onEntryClick: (entry: SearchHistoryEntry) => void
  onRemoveEntry: (index: number) => void
  onClear: () => void
  onClose: () => void
}

const mockSearchBarProps: MockSearchBarProps[] = []
const mockSearchHistoryMenuProps: MockSearchHistoryMenuProps[] = []

vi.mock('../components/search/SearchBar', () => ({
  default: (props: MockSearchBarProps) => {
    mockSearchBarProps.push(props)

    return (
      <button type="button" onClick={props.onSearch}>
        search bar
      </button>
    )
  },
}))

vi.mock('../components/search/SearchHistoryMenu', () => ({
  default: (props: MockSearchHistoryMenuProps) => {
    mockSearchHistoryMenuProps.push(props)

    return (
      <button type="button" onClick={() => props.onEntryClick(props.entries[0])}>
        history menu
      </button>
    )
  },
}))

const { default: SearchQueryPanel } = await import('./SearchQueryPanel')

function renderSearchQueryPanel(element: React.ReactElement) {
  return renderReactElement(element)
}

const historyEntry: SearchHistoryEntry = {
  query: '五悠',
  sort: 'date_desc',
  searchTarget: 'keyword',
  timestamp: 1,
}

describe('SearchQueryPanel', () => {
  it('forwards search bar props and shows history only when enabled with entries', () => {
    mockSearchBarProps.length = 0
    mockSearchHistoryMenuProps.length = 0
    const onQueryChange = vi.fn()
    const onSearch = vi.fn()
    const onShowHistory = vi.fn()
    const onHistoryClick = vi.fn()
    const onRemoveFromHistory = vi.fn()
    const onClearHistory = vi.fn()
    const onCloseHistory = vi.fn()
    const { container, unmount } = renderSearchQueryPanel(
      <SearchQueryPanel
        query="五悠"
        searchHistory={[historyEntry]}
        showHistory={true}
        maxQueryLength={100}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
        onShowHistory={onShowHistory}
        onHistoryClick={onHistoryClick}
        onRemoveFromHistory={onRemoveFromHistory}
        onClearHistory={onClearHistory}
        onCloseHistory={onCloseHistory}
      />,
    )

    expect(mockSearchBarProps[0]).toMatchObject({
      value: '五悠',
      maxLength: 100,
    })
    expect(mockSearchHistoryMenuProps[0].entries).toEqual([historyEntry])

    act(() => {
      mockSearchBarProps[0].onChange('夏五')
      mockSearchBarProps[0].onFocus?.()
      getButtonByText(container, 'search bar').click()
      getButtonByText(container, 'history menu').click()
      mockSearchHistoryMenuProps[0].onRemoveEntry(0)
      mockSearchHistoryMenuProps[0].onClear()
      mockSearchHistoryMenuProps[0].onClose()
    })

    expect(onQueryChange).toHaveBeenCalledWith('夏五')
    expect(onShowHistory).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onHistoryClick).toHaveBeenCalledWith(historyEntry)
    expect(onRemoveFromHistory).toHaveBeenCalledWith(0)
    expect(onClearHistory).toHaveBeenCalledTimes(1)
    expect(onCloseHistory).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('does not render the history menu without entries', () => {
    mockSearchHistoryMenuProps.length = 0
    const { unmount } = renderSearchQueryPanel(
      <SearchQueryPanel
        query=""
        searchHistory={[]}
        showHistory={true}
        maxQueryLength={100}
        onQueryChange={vi.fn()}
        onSearch={vi.fn()}
        onShowHistory={vi.fn()}
        onHistoryClick={vi.fn()}
        onRemoveFromHistory={vi.fn()}
        onClearHistory={vi.fn()}
        onCloseHistory={vi.fn()}
      />,
    )

    expect(mockSearchHistoryMenuProps).toHaveLength(0)

    unmount()
  })
})
