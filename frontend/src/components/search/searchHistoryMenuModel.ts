import type { SearchHistoryEntry } from '../../types/search'

interface SearchHistoryEntryMetaInput {
  entry: SearchHistoryEntry
  bookmarkSuffix: string
  formatNumber: (value: number) => string
  searchTargetLabel: (target: SearchHistoryEntry['searchTarget']) => string
  sortLabel: (sort: SearchHistoryEntry['sort']) => string
}

export function buildSearchHistoryEntryMeta({
  entry,
  bookmarkSuffix,
  formatNumber,
  searchTargetLabel,
  sortLabel,
}: SearchHistoryEntryMetaInput) {
  const bookmarkNum = entry.bookmarkNum || 0

  return {
    query: entry.query,
    targetLabel: searchTargetLabel(entry.searchTarget),
    sortLabel: sortLabel(entry.sort),
    bookmarkLabel: bookmarkNum > 0 ? `${formatNumber(bookmarkNum)}+${bookmarkSuffix}` : null,
    removeAriaLabel: `删除 ${entry.query}`,
  }
}
