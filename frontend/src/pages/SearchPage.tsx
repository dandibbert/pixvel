import { useState, useEffect, useMemo, useCallback } from 'react'
import { useURLState } from '../hooks/useURLState'
import { useNovelPreview } from '../hooks/useNovelPreview'
import { useSearchStore } from '../stores/searchStore'
import { useI18n } from '../i18n/useI18n'
import SearchResultsSection from '../components/search/SearchResultsSection'
import NovelPreviewModal, {
  type NovelPreviewModalProps,
} from '../components/novel/NovelPreviewModal'
import { useSearchKeywordRules } from '../contexts/SearchKeywordRulesContext'
import { Novel, SearchHistoryEntry } from '../types/search'
import { setDocumentTitle } from '../utils/documentTitle'
import { scrollViewportToTop } from '../utils/pageScroll'
import {
  buildSearchDocumentTitle,
  buildDisplayKeywordMatchMap,
  buildKeywordMatchMap,
  createFilterStateFromCachedFilters,
  createFilterStateFromHistoryEntry,
  MAX_SEARCH_QUERY_LENGTH,
  resolveInitialSearchHydration,
  resolveSearchExecution,
  resolveSelectedNovelKeywordMatch,
  type SearchFilterOverrides,
  type SearchFilterState,
  type SearchSort,
} from './searchPageModel'
import SearchErrorBanner from './SearchErrorBanner'
import SearchFilterToolbar from './SearchFilterToolbar'
import SearchPageHero from './SearchPageHero'
import SearchQueryPanel from './SearchQueryPanel'

export default function SearchPage() {
  const { t } = useI18n()
  const [urlState, setUrlState] = useURLState({
    q: '',
    page: 1,
    sort: 'date_desc',
    target: '',
  })

  const {
    results,
    total,
    totalPages,
    visibleResultCount,
    isLoading,
    error,
    searchHistory,
    query: cachedQuery,
    filters: cachedFilters,
    page: cachedPage,
    setQuery,
    search,
    clearError,
    removeFromHistory,
    clearHistory,
    showMoreResults,
  } = useSearchStore()
  const { blockedWords, highlightWords, revealedBlockedIds, revealBlockedId } =
    useSearchKeywordRules()

  const [query, setLocalQuery] = useState(urlState.q || '')
  const [filters, setFilters] = useState<SearchFilterState>(() =>
    createFilterStateFromCachedFilters(cachedFilters, urlState.target),
  )
  const novelPreview = useNovelPreview<Novel>()
  const [showHistory, setShowHistory] = useState(false)

  const updateFilter = useCallback(<K extends keyof SearchFilterState>(
    name: K,
    value: SearchFilterState[K],
  ) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }, [])

  const keywordMatchMap = useMemo(
    () => buildKeywordMatchMap(results, blockedWords, highlightWords),
    [results, blockedWords, highlightWords],
  )

  const displayKeywordMatchMap = useMemo(
    () => buildDisplayKeywordMatchMap(keywordMatchMap, revealedBlockedIds),
    [keywordMatchMap, revealedBlockedIds],
  )

  const handleRevealBlocked = useCallback((novelId: string) => {
    revealBlockedId(novelId)
  }, [revealBlockedId])

  const selectedNovelMatch = resolveSelectedNovelKeywordMatch(
    displayKeywordMatchMap,
    novelPreview.selectedNovel,
  )
  const previewModalProps: NovelPreviewModalProps = {
    ...novelPreview.previewModalProps,
    keywordMatch: selectedNovelMatch,
    onRevealBlocked: handleRevealBlocked,
    highlightWords,
  }

  useEffect(() => {
    setDocumentTitle(buildSearchDocumentTitle({
      query: urlState.q,
      prefix: t('search.documentTitlePrefix'),
      defaultTitle: t('search.documentTitleDefault'),
    }))
  }, [urlState.q, t])

  useEffect(() => {
    const hydration = resolveInitialSearchHydration({
      urlState,
      currentFilters: filters,
      cachedFilters,
      cachedQuery,
      cachedPage,
      resultCount: results.length,
    })

    if (hydration) {
      setLocalQuery(hydration.query)
      setQuery(hydration.query)
      setFilters(hydration.filters)

      if (hydration.shouldSearch) {
        handleSearch(
          hydration.search.query,
          hydration.search.page,
          hydration.search.sort,
          hydration.search.filters,
        )
      }
    }
  }, [])

  const handleSearch = async (
    searchQuery?: string,
    searchPage?: number,
    searchSort?: SearchSort,
    options?: SearchFilterOverrides,
  ) => {
    setShowHistory(false)
    const execution = resolveSearchExecution({
      currentQuery: query,
      currentPage: urlState.page,
      currentSort: urlState.sort as SearchSort,
      currentFilters: filters,
      searchQuery,
      searchPage,
      searchSort,
      filterOverrides: options,
    })

    if (!execution) return

    setUrlState(execution.urlState)
    setFilters(execution.filters)

    setQuery(execution.query)
    await search(execution.storeParams)
  }

  const handleSortChange = (sort: SearchSort) => {
    if (query) {
      handleSearch(query, 1, sort)
    }
  }

  const handlePageChange = (newPage: number) => {
    handleSearch(query, newPage, urlState.sort as SearchSort)
    scrollViewportToTop()
  }

  const handleHistoryClick = (entry: SearchHistoryEntry) => {
    const historyFilters = createFilterStateFromHistoryEntry(entry)

    setLocalQuery(entry.query)
    setFilters(historyFilters)

    handleSearch(entry.query, 1, entry.sort, historyFilters)
  }

  return (
    <div className="min-h-screen">
      <SearchPageHero title={t('search.title')} subtitle={t('search.subtitle')} />

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div
          data-testid="search-content-card"
          className="bg-transparent md:bg-white rounded-none md:rounded-2xl p-0 md:p-8 border-0 md:border md:border-border/50 shadow-none md:shadow-xl md:shadow-black/5"
        >
          <div className="mb-6 md:mb-10 space-y-4 md:space-y-6">
            <SearchQueryPanel
              query={query}
              searchHistory={searchHistory}
              showHistory={showHistory}
              maxQueryLength={MAX_SEARCH_QUERY_LENGTH}
              onQueryChange={setLocalQuery}
              onSearch={() => handleSearch()}
              onShowHistory={() => setShowHistory(true)}
              onHistoryClick={handleHistoryClick}
              onRemoveFromHistory={removeFromHistory}
              onClearHistory={clearHistory}
              onCloseHistory={() => setShowHistory(false)}
            />

            <SearchFilterToolbar
              filters={filters}
              sort={urlState.sort as SearchSort}
              onFilterChange={updateFilter}
              onApplyFilters={() => handleSearch()}
              onSortChange={handleSortChange}
            />
          </div>

          {error && <SearchErrorBanner error={error} onClear={clearError} />}

          <SearchResultsSection
            isLoading={isLoading}
            results={results}
            total={total}
            totalPages={totalPages}
            currentPage={urlState.page}
            visibleResultCount={visibleResultCount}
            hasSearchQuery={Boolean(urlState.q)}
            keywordMatchMap={displayKeywordMatchMap}
            onNovelClick={novelPreview.openPreview}
            onRevealBlocked={handleRevealBlocked}
            onPageChange={handlePageChange}
            onShowMoreResults={showMoreResults}
          />
        </div>
      </div>

      <NovelPreviewModal
        {...previewModalProps}
      />
    </div>
  )
}
