import SearchBar from '../components/search/SearchBar'
import SearchHistoryMenu from '../components/search/SearchHistoryMenu'
import type { SearchHistoryEntry } from '../types/search'

interface SearchQueryPanelProps {
  query: string
  searchHistory: ReadonlyArray<SearchHistoryEntry>
  showHistory: boolean
  maxQueryLength: number
  onQueryChange: (query: string) => void
  onSearch: () => void
  onShowHistory: () => void
  onHistoryClick: (entry: SearchHistoryEntry) => void
  onRemoveFromHistory: (index: number) => void
  onClearHistory: () => void
  onCloseHistory: () => void
}

export default function SearchQueryPanel({
  query,
  searchHistory,
  showHistory,
  maxQueryLength,
  onQueryChange,
  onSearch,
  onShowHistory,
  onHistoryClick,
  onRemoveFromHistory,
  onClearHistory,
  onCloseHistory,
}: SearchQueryPanelProps) {
  return (
    <div className="relative">
      <SearchBar
        value={query}
        onChange={onQueryChange}
        onSearch={onSearch}
        onFocus={onShowHistory}
        maxLength={maxQueryLength}
      />

      {showHistory && searchHistory.length > 0 && (
        <SearchHistoryMenu
          entries={searchHistory}
          onEntryClick={onHistoryClick}
          onRemoveEntry={onRemoveFromHistory}
          onClear={onClearHistory}
          onClose={onCloseHistory}
        />
      )}
    </div>
  )
}
