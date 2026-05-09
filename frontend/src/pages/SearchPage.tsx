import { useState, useEffect, useMemo, useCallback } from 'react'
import { useURLState } from '../hooks/useURLState'
import { useSearchStore } from '../stores/searchStore'
import { useI18n } from '../i18n/useI18n'
import SearchBar from '../components/search/SearchBar'
import FilterPanel from '../components/search/FilterPanel'
import SortControls from '../components/search/SortControls'
import NovelGrid from '../components/novel/NovelGrid'
import NovelPreviewModal, {
  type NovelPreviewModalProps,
} from '../components/novel/NovelPreviewModal'
import Pagination from '../components/common/Pagination'
import { useSearchKeywordRules } from '../contexts/SearchKeywordRulesContext'
import { evaluateNovelKeywordMatch } from '../utils/keywordFilter'
import { Novel, SearchHistoryEntry, type NovelKeywordMatchResult } from '../types/search'

type SearchTarget = 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
type SearchSort = 'date_desc' | 'date_asc' | 'popular_desc'
type SearchLang = 'ja' | 'zh-CN'
type SearchAiType = '0' | '1'
type NovelMatchMap = Readonly<Record<string, NovelKeywordMatchResult>>

const MAX_SEARCH_QUERY_LENGTH = 100

function getCachedSearchTarget(searchTarget?: string): SearchTarget {
  if (
    searchTarget === 'partial_match_for_tags' ||
    searchTarget === 'exact_match_for_tags' ||
    searchTarget === 'text' ||
    searchTarget === 'keyword'
  ) {
    return searchTarget
  }

  return 'keyword'
}

function getCachedLang(lang?: string): SearchLang {
  return lang === 'zh-CN' ? 'zh-CN' : 'ja'
}

function getCachedSearchAiType(searchAiType?: string): SearchAiType {
  return searchAiType === '0' ? '0' : '1'
}

export default function SearchPage() {
  const { t, formatNumber, searchTargetLabel, sortLabel } = useI18n()
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
  } = useSearchStore()
  const { blockedWords, highlightWords, revealedBlockedIds, revealBlockedId } =
    useSearchKeywordRules()

  const [query, setLocalQuery] = useState(urlState.q || '')
  const [searchTarget, setSearchTarget] = useState<SearchTarget>(
    (urlState.target as SearchTarget) || getCachedSearchTarget(cachedFilters.searchTarget)
  )
  const [startDate, setStartDate] = useState(cachedFilters.startDate || '')
  const [endDate, setEndDate] = useState(cachedFilters.endDate || '')
  const [bookmarkNum, setBookmarkNum] = useState(cachedFilters.bookmarkNum || 0)
  const [bookmarkNumMin, setBookmarkNumMin] = useState(cachedFilters.bookmarkNumMin || cachedFilters.bookmarkNum || 0)
  const [bookmarkNumMax, setBookmarkNumMax] = useState(cachedFilters.bookmarkNumMax || 0)
  const [textLengthMin, setTextLengthMin] = useState(cachedFilters.textLengthMin || 0)
  const [lang, setLang] = useState<SearchLang>(getCachedLang(cachedFilters.lang))
  const [includePotentialViolationWorks, setIncludePotentialViolationWorks] = useState(
    cachedFilters.includePotentialViolationWorks ?? false,
  )
  const [includeTranslatedTagResults, setIncludeTranslatedTagResults] = useState(
    cachedFilters.includeTranslatedTagResults ?? true,
  )
  const [isOriginalOnly, setIsOriginalOnly] = useState(cachedFilters.isOriginalOnly ?? false)
  const [isReplaceableOnly, setIsReplaceableOnly] = useState(cachedFilters.isReplaceableOnly ?? false)
  const [mergePlainKeywordResults, setMergePlainKeywordResults] = useState(
    cachedFilters.mergePlainKeywordResults ?? true,
  )
  const [searchAiType, setSearchAiType] = useState<SearchAiType>(getCachedSearchAiType(cachedFilters.searchAiType))
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const keywordMatchMap = useMemo<NovelMatchMap>(() => {
    if (results.length === 0) return {}

    return results.reduce<Record<string, NovelKeywordMatchResult>>((map, novel) => {
      map[novel.id] = evaluateNovelKeywordMatch(novel, blockedWords, highlightWords)
      return map
    }, {})
  }, [results, blockedWords, highlightWords])

  const displayKeywordMatchMap = useMemo<NovelMatchMap>(() => {
    if (results.length === 0) return {}

    return results.reduce<Record<string, NovelKeywordMatchResult>>((map, novel) => {
      const match = keywordMatchMap[novel.id]
      if (!match) return map

      map[novel.id] = {
        ...match,
        isBlocked: match.isBlocked && !revealedBlockedIds.has(novel.id),
      }

      return map
    }, {})
  }, [results, keywordMatchMap, revealedBlockedIds])

  const handleRevealBlocked = useCallback((novelId: string) => {
    revealBlockedId(novelId)
  }, [revealBlockedId])

  const selectedNovelMatch = selectedNovel ? displayKeywordMatchMap[selectedNovel.id] : undefined
  const previewModalProps: NovelPreviewModalProps = {
    novel: selectedNovel,
    isOpen: isModalOpen,
    onClose: () => setIsModalOpen(false),
    keywordMatch: selectedNovelMatch,
    onRevealBlocked: handleRevealBlocked,
    highlightWords,
  }

  useEffect(() => {
    const searchQuery = urlState.q?.trim()
    document.title = searchQuery
      ? `${t('search.documentTitlePrefix')}「${searchQuery}」- Pixvel`
      : t('search.documentTitleDefault')
  }, [urlState.q, t])

  useEffect(() => {
    if (urlState.q) {
      const targetFromState = urlState.target
        ? getCachedSearchTarget(urlState.target)
        : getCachedSearchTarget(cachedFilters.searchTarget)

      setLocalQuery(urlState.q)
      setQuery(urlState.q)
      setSearchTarget(targetFromState)

      const filterOptions = {
        searchTarget: targetFromState,
        startDate,
        endDate,
        bookmarkNum,
        bookmarkNumMin,
        bookmarkNumMax,
        textLengthMin,
        lang,
        includePotentialViolationWorks,
        includeTranslatedTagResults,
        isOriginalOnly,
        isReplaceableOnly,
        mergePlainKeywordResults,
        searchAiType,
      }
      const isCachedFilterState =
        cachedFilters.searchTarget === filterOptions.searchTarget &&
        (cachedFilters.startDate || '') === filterOptions.startDate &&
        (cachedFilters.endDate || '') === filterOptions.endDate &&
        (cachedFilters.bookmarkNum || 0) === filterOptions.bookmarkNum &&
        (cachedFilters.bookmarkNumMin || cachedFilters.bookmarkNum || 0) === filterOptions.bookmarkNumMin &&
        (cachedFilters.bookmarkNumMax || 0) === filterOptions.bookmarkNumMax &&
        (cachedFilters.textLengthMin || 0) === filterOptions.textLengthMin &&
        getCachedLang(cachedFilters.lang) === filterOptions.lang &&
        (cachedFilters.includePotentialViolationWorks ?? false) === filterOptions.includePotentialViolationWorks &&
        (cachedFilters.includeTranslatedTagResults ?? true) === filterOptions.includeTranslatedTagResults &&
        (cachedFilters.isOriginalOnly ?? false) === filterOptions.isOriginalOnly &&
        (cachedFilters.isReplaceableOnly ?? false) === filterOptions.isReplaceableOnly &&
        (cachedFilters.mergePlainKeywordResults ?? true) === filterOptions.mergePlainKeywordResults &&
        getCachedSearchAiType(cachedFilters.searchAiType) === filterOptions.searchAiType

      const isCachedQuery =
        cachedQuery === urlState.q &&
        cachedPage === urlState.page &&
        cachedFilters.sort === urlState.sort &&
        isCachedFilterState &&
        results.length > 0

      if (!isCachedQuery) {
        handleSearch(urlState.q, urlState.page, urlState.sort as SearchSort, filterOptions)
      }
    }
  }, [])

  const handleSearch = async (
    searchQuery?: string,
    searchPage?: number,
    searchSort?: SearchSort,
    options?: {
      searchTarget?: SearchTarget
      startDate?: string
      endDate?: string
      bookmarkNum?: number
      bookmarkNumMin?: number
      bookmarkNumMax?: number
      textLengthMin?: number
      lang?: SearchLang
      includePotentialViolationWorks?: boolean
      includeTranslatedTagResults?: boolean
      isOriginalOnly?: boolean
      isReplaceableOnly?: boolean
      mergePlainKeywordResults?: boolean
      searchAiType?: SearchAiType
    }
  ) => {
    setShowHistory(false)
    const queryToUse = searchQuery !== undefined ? searchQuery : query
    const pageToUse = searchPage !== undefined ? searchPage : urlState.page
    const sortToUse = searchSort !== undefined ? searchSort : (urlState.sort as SearchSort)

    const targetToUse = options?.searchTarget ?? searchTarget
    const startDateToUse = options && 'startDate' in options ? options.startDate : startDate
    const endDateToUse = options && 'endDate' in options ? options.endDate : endDate
    const bookmarkNumToUse = options?.bookmarkNum ?? bookmarkNum
    const bookmarkNumMinToUse = options?.bookmarkNumMin ?? bookmarkNumMin
    const bookmarkNumMaxToUse = options?.bookmarkNumMax ?? bookmarkNumMax
    const textLengthMinToUse = options?.textLengthMin ?? textLengthMin
    const langToUse = options?.lang ?? lang
    const includePotentialViolationWorksToUse =
      options?.includePotentialViolationWorks ?? includePotentialViolationWorks
    const includeTranslatedTagResultsToUse =
      options?.includeTranslatedTagResults ?? includeTranslatedTagResults
    const isOriginalOnlyToUse = options?.isOriginalOnly ?? isOriginalOnly
    const isReplaceableOnlyToUse = options?.isReplaceableOnly ?? isReplaceableOnly
    const mergePlainKeywordResultsToUse =
      options?.mergePlainKeywordResults ?? mergePlainKeywordResults
    const searchAiTypeToUse = options?.searchAiType ?? searchAiType

    if (!queryToUse.trim() || queryToUse.length > MAX_SEARCH_QUERY_LENGTH) return

    setUrlState({ q: queryToUse, page: pageToUse, sort: sortToUse, target: targetToUse })
    setSearchTarget(targetToUse)

    setQuery(queryToUse)
    await search({
      query: queryToUse,
      page: pageToUse,
      sort: sortToUse,
      searchTarget: targetToUse,
      startDate: startDateToUse || undefined,
      endDate: endDateToUse || undefined,
      bookmarkNum: bookmarkNumToUse > 0 ? bookmarkNumToUse : undefined,
      bookmarkNumMin: bookmarkNumMinToUse > 0 ? bookmarkNumMinToUse : undefined,
      bookmarkNumMax: bookmarkNumMaxToUse > 0 ? bookmarkNumMaxToUse : undefined,
      textLengthMin: textLengthMinToUse > 0 ? textLengthMinToUse : undefined,
      lang: langToUse,
      includePotentialViolationWorks: includePotentialViolationWorksToUse,
      includeTranslatedTagResults: includeTranslatedTagResultsToUse,
      isOriginalOnly: isOriginalOnlyToUse,
      isReplaceableOnly: isReplaceableOnlyToUse,
      mergePlainKeywordResults: mergePlainKeywordResultsToUse,
      searchAiType: searchAiTypeToUse,
    })
  }

  const handleSortChange = (sort: SearchSort) => {
    if (query) {
      handleSearch(query, 1, sort)
    }
  }

  const handlePageChange = (newPage: number) => {
    handleSearch(query, newPage, urlState.sort as SearchSort)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNovelClick = (novel: Novel) => {
    setSelectedNovel(novel)
    setIsModalOpen(true)
  }

  const handleHistoryClick = (entry: SearchHistoryEntry) => {
    const entryBookmarkMin = entry.bookmarkNumMin || entry.bookmarkNum || 0
    const entryBookmarkMax = entry.bookmarkNumMax || 0
    const entryTextLengthMin = entry.textLengthMin || 0
    const entryLang = entry.lang || 'ja'
    const entryIncludePotentialViolationWorks = entry.includePotentialViolationWorks ?? false
    const entryIncludeTranslatedTagResults = entry.includeTranslatedTagResults ?? true
    const entryIsOriginalOnly = entry.isOriginalOnly ?? false
    const entryIsReplaceableOnly = entry.isReplaceableOnly ?? false
    const entryMergePlainKeywordResults = entry.mergePlainKeywordResults ?? true
    const entrySearchAiType = entry.searchAiType || '1'

    setLocalQuery(entry.query)
    setSearchTarget(entry.searchTarget)
    setStartDate(entry.startDate || '')
    setEndDate(entry.endDate || '')
    setBookmarkNum(entry.bookmarkNum || 0)
    setBookmarkNumMin(entryBookmarkMin)
    setBookmarkNumMax(entryBookmarkMax)
    setTextLengthMin(entryTextLengthMin)
    setLang(entryLang)
    setIncludePotentialViolationWorks(entryIncludePotentialViolationWorks)
    setIncludeTranslatedTagResults(entryIncludeTranslatedTagResults)
    setIsOriginalOnly(entryIsOriginalOnly)
    setIsReplaceableOnly(entryIsReplaceableOnly)
    setMergePlainKeywordResults(entryMergePlainKeywordResults)
    setSearchAiType(entrySearchAiType)

    handleSearch(entry.query, 1, entry.sort, {
      searchTarget: entry.searchTarget,
      startDate: entry.startDate,
      endDate: entry.endDate,
      bookmarkNum: entry.bookmarkNum,
      bookmarkNumMin: entryBookmarkMin,
      bookmarkNumMax: entryBookmarkMax,
      textLengthMin: entryTextLengthMin,
      lang: entryLang,
      includePotentialViolationWorks: entryIncludePotentialViolationWorks,
      includeTranslatedTagResults: entryIncludeTranslatedTagResults,
      isOriginalOnly: entryIsOriginalOnly,
      isReplaceableOnly: entryIsReplaceableOnly,
      mergePlainKeywordResults: entryMergePlainKeywordResults,
      searchAiType: entrySearchAiType,
    })
  }

  return (
    <div className="min-h-screen">
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 tracking-tight">{t('search.title')}</h1>
          <p className="text-white/80 text-sm md:text-xl font-medium max-w-2xl mx-auto md:mx-0">
            {t('search.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-border/50 shadow-xl shadow-black/5">
          <div className="mb-6 md:mb-10 space-y-4 md:space-y-6">
            <div className="relative">
              <SearchBar
                value={query}
                onChange={setLocalQuery}
                onSearch={() => handleSearch()}
                onFocus={() => setShowHistory(true)}
                maxLength={MAX_SEARCH_QUERY_LENGTH}
              />

              {showHistory && searchHistory.length > 0 && (
                <div className="absolute z-20 w-full mt-4 bg-white rounded-lg border-4 border-primary overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 bg-muted border-b-2 border-primary/10">
                    <span className="text-xs font-black text-foreground/40 uppercase tracking-widest">{t('search.historyRecent')}</span>
                    <div className="flex gap-6">
                      <button
                        onClick={clearHistory}
                        className="text-xs font-black text-foreground/40 hover:text-accent transition-colors"
                      >
                        {t('search.historyClear')}
                      </button>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-xs font-black text-primary hover:scale-110 transition-transform"
                      >
                        {t('search.historyClose')}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between px-6 py-4 hover:bg-muted cursor-pointer border-b-2 border-muted last:border-0 transition-all"
                        onClick={() => handleHistoryClick(entry)}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-foreground truncate">{entry.query}</div>
                            <div className="text-[10px] font-black text-foreground/30 flex items-center gap-3 truncate uppercase tracking-widest">
                              <span className="bg-muted px-2 py-0.5 rounded">{searchTargetLabel(entry.searchTarget)}</span>
                              <span>{sortLabel(entry.sort)}</span>
                              {(entry.bookmarkNum || 0) > 0 && <span className="text-primary">{formatNumber(entry.bookmarkNum || 0)}+{t('search.historyBookmarkSuffix')}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromHistory(index)
                          }}
                          className="text-foreground/10 hover:text-accent p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <FilterPanel
                searchTarget={searchTarget}
                startDate={startDate}
                endDate={endDate}
                bookmarkNum={bookmarkNum}
                bookmarkNumMin={bookmarkNumMin}
                bookmarkNumMax={bookmarkNumMax}
                textLengthMin={textLengthMin}
                lang={lang}
                includePotentialViolationWorks={includePotentialViolationWorks}
                includeTranslatedTagResults={includeTranslatedTagResults}
                isOriginalOnly={isOriginalOnly}
                isReplaceableOnly={isReplaceableOnly}
                mergePlainKeywordResults={mergePlainKeywordResults}
                searchAiType={searchAiType}
                onSearchTargetChange={setSearchTarget}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onBookmarkNumChange={setBookmarkNum}
                onBookmarkNumMinChange={setBookmarkNumMin}
                onBookmarkNumMaxChange={setBookmarkNumMax}
                onTextLengthMinChange={setTextLengthMin}
                onLangChange={setLang}
                onIncludePotentialViolationWorksChange={setIncludePotentialViolationWorks}
                onIncludeTranslatedTagResultsChange={setIncludeTranslatedTagResults}
                onIsOriginalOnlyChange={setIsOriginalOnly}
                onIsReplaceableOnlyChange={setIsReplaceableOnly}
                onMergePlainKeywordResultsChange={setMergePlainKeywordResults}
                onSearchAiTypeChange={setSearchAiType}
                onApply={() => handleSearch()}
              />
              <SortControls value={urlState.sort as SearchSort} onChange={handleSortChange} />
            </div>
          </div>

          {error && (
            <div className="mb-6 md:mb-8 p-4 md:p-6 bg-accent/10 border-l-4 border-accent rounded-r-lg flex items-center justify-between">
              <p className="text-accent font-bold text-base md:text-lg">{error}</p>
              <button
                onClick={clearError}
                className="text-accent hover:scale-125 transition-transform p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16 md:py-20">
              <div className="inline-block animate-bounce h-12 w-12 md:h-16 md:w-16 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-primary uppercase tracking-widest">{t('search.loading')}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 md:mb-6 flex items-center justify-between">
                <div className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                  {t('search.resultsFoundPrefix')} {formatNumber(total)} {t('search.resultsFoundSuffix')}
                </div>
              </div>
              <NovelGrid
                novels={results}
                onNovelClick={handleNovelClick}
                keywordMatchMap={displayKeywordMatchMap}
                onRevealBlocked={handleRevealBlocked}
              />
              {totalPages > 1 && (
                <div className="mt-12 md:mt-16">
                  <Pagination
                    currentPage={urlState.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : urlState.q ? (
            <div className="text-center py-16 md:py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="p-6 md:p-8 bg-muted rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground/30 uppercase">{t('search.emptyNoResults')}</p>
            </div>
          ) : (
            <div className="text-center py-16 md:py-24 bg-muted/50 rounded-xl">
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="p-6 md:p-8 bg-muted rounded-full animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground/30 uppercase tracking-widest">{t('search.emptyStartSearch')}</p>
            </div>
          )}
        </div>
      </div>

      <NovelPreviewModal
        {...previewModalProps}
      />
    </div>
  )
}
