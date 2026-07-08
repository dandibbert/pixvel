import { describe, expect, it } from 'vitest'
import type { SearchHistoryEntry, SearchParams } from '../types/search'
import * as searchPageModel from './searchPageModel'
import {
  areSearchFiltersEquivalent,
  buildSearchDocumentTitle,
  buildDisplayKeywordMatchMap,
  buildKeywordMatchMap,
  resolveSelectedNovelKeywordMatch,
  buildSearchStoreParams,
  createFilterStateFromCachedFilters,
  createFilterStateFromHistoryEntry,
  normalizeSearchAiType,
  normalizeSearchLang,
  normalizeSearchTarget,
  resolveSearchExecution,
  type SearchFilterState,
} from './searchPageModel'

type ResolveInitialSearchHydration = (args: {
  urlState: {
    q: string
    page: number
    sort: string
    target: string
  }
  currentFilters: SearchFilterState
  cachedFilters: Omit<SearchParams, 'query'>
  cachedQuery: string
  cachedPage: number
  resultCount: number
}) => null | {
  query: string
  filters: SearchFilterState
  shouldSearch: boolean
  search: {
    query: string
    page: number
    sort: SearchParams['sort']
    filters: SearchFilterState
  }
}

describe('searchPageModel', () => {
  it('builds keyword match maps keyed by novel id', () => {
    const novels = [
      {
        id: 'blocked',
        title: 'Forbidden Highlight',
        description: 'A matched description',
        author: { id: 'author-1', name: 'Author' },
        tags: ['safe'],
        pageCount: 1,
        textLength: 100,
        totalBookmarks: 0,
        totalViews: 0,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
      {
        id: 'plain',
        title: 'Plain Novel',
        description: '',
        author: { id: 'author-2', name: 'Author' },
        tags: [],
        pageCount: 1,
        textLength: 100,
        totalBookmarks: 0,
        totalViews: 0,
        createdAt: '2026-04-26T00:00:00.000Z',
        updatedAt: '2026-04-26T00:00:00.000Z',
      },
    ]

    expect(buildKeywordMatchMap(novels, ['forbidden'], ['highlight'])).toEqual({
      blocked: {
        isBlocked: true,
        blockedHits: ['forbidden'],
        highlightHits: ['highlight'],
        hasCardHighlight: true,
        hasModalOnlyHighlight: false,
      },
      plain: {
        isBlocked: false,
        blockedHits: [],
        highlightHits: [],
        hasCardHighlight: false,
        hasModalOnlyHighlight: false,
      },
    })
  })

  it('masks blocked keyword matches after the user reveals a novel', () => {
    const keywordMatchMap = {
      revealed: {
        isBlocked: true,
        blockedHits: ['blocked'],
        highlightHits: [],
        hasCardHighlight: false,
        hasModalOnlyHighlight: false,
      },
      hidden: {
        isBlocked: true,
        blockedHits: ['blocked'],
        highlightHits: [],
        hasCardHighlight: false,
        hasModalOnlyHighlight: false,
      },
    }

    expect(buildDisplayKeywordMatchMap(keywordMatchMap, new Set(['revealed']))).toEqual({
      revealed: {
        isBlocked: false,
        blockedHits: ['blocked'],
        highlightHits: [],
        hasCardHighlight: false,
        hasModalOnlyHighlight: false,
      },
      hidden: {
        isBlocked: true,
        blockedHits: ['blocked'],
        highlightHits: [],
        hasCardHighlight: false,
        hasModalOnlyHighlight: false,
      },
    })
  })

  it('resolves the selected novel keyword match for the preview modal', () => {
    const keywordMatchMap = {
      selected: {
        isBlocked: false,
        blockedHits: [],
        highlightHits: ['match'],
        hasCardHighlight: true,
        hasModalOnlyHighlight: false,
      },
    }
    const selectedNovel = {
      id: 'selected',
      title: 'Selected Novel',
      description: '',
      author: { id: 'author-1', name: 'Author' },
      tags: [],
      pageCount: 1,
      textLength: 100,
      totalBookmarks: 0,
      totalViews: 0,
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    }

    expect(resolveSelectedNovelKeywordMatch(keywordMatchMap, selectedNovel)).toEqual({
      isBlocked: false,
      blockedHits: [],
      highlightHits: ['match'],
      hasCardHighlight: true,
      hasModalOnlyHighlight: false,
    })
    expect(resolveSelectedNovelKeywordMatch(keywordMatchMap, null)).toBeUndefined()
    expect(resolveSelectedNovelKeywordMatch(keywordMatchMap, {
      ...selectedNovel,
      id: 'missing',
    })).toBeUndefined()
  })

  it('normalizes URL and cached enum values to supported search values', () => {
    expect(normalizeSearchTarget('exact_match_for_tags')).toBe('exact_match_for_tags')
    expect(normalizeSearchTarget('bad_target')).toBe('keyword')
    expect(normalizeSearchTarget(undefined)).toBe('keyword')

    expect(normalizeSearchLang('zh-CN')).toBe('zh-CN')
    expect(normalizeSearchLang('en')).toBe('ja')

    expect(normalizeSearchAiType('0')).toBe('0')
    expect(normalizeSearchAiType('2')).toBe('1')
  })

  it('builds search document titles from localized labels and trimmed queries', () => {
    expect(buildSearchDocumentTitle({
      query: '',
      prefix: '搜索结果',
      defaultTitle: '搜索小说 - Pixvel',
    })).toBe('搜索小说 - Pixvel')
    expect(buildSearchDocumentTitle({
      query: '  五悠  ',
      prefix: '搜索结果',
      defaultTitle: '搜索小说 - Pixvel',
    })).toBe('搜索结果「五悠」- Pixvel')
  })

  it('builds search store params while omitting empty optional filters', () => {
    const filters: SearchFilterState = {
      searchTarget: 'keyword',
      startDate: '',
      endDate: undefined,
      bookmarkNum: 0,
      bookmarkNumMin: 0,
      bookmarkNumMax: 4999,
      textLengthMin: 0,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    }

    expect(buildSearchStoreParams({
      query: '五悠',
      page: 2,
      sort: 'popular_desc',
      filters,
    })).toEqual({
      query: '五悠',
      page: 2,
      sort: 'popular_desc',
      searchTarget: 'keyword',
      startDate: undefined,
      endDate: undefined,
      bookmarkNum: undefined,
      bookmarkNumMin: undefined,
      bookmarkNumMax: 4999,
      textLengthMin: undefined,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    })
  })

  it('restores filter state from history entries with the same defaults as the search page', () => {
    const entry: SearchHistoryEntry = {
      query: '五悠',
      sort: 'date_desc',
      searchTarget: 'keyword',
      timestamp: 1,
    }

    expect(createFilterStateFromHistoryEntry(entry)).toEqual({
      searchTarget: 'keyword',
      startDate: '',
      endDate: '',
      bookmarkNum: 0,
      bookmarkNumMin: 0,
      bookmarkNumMax: 0,
      textLengthMin: 0,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    })
  })

  it('normalizes stale persisted enum values from history entries', () => {
    const entry = {
      query: '五悠',
      sort: 'date_desc',
      searchTarget: 'stale_target',
      lang: 'en',
      searchAiType: '2',
      timestamp: 1,
    } as unknown as SearchHistoryEntry

    expect(createFilterStateFromHistoryEntry(entry)).toMatchObject({
      searchTarget: 'keyword',
      lang: 'ja',
      searchAiType: '1',
    })
  })

  it('keeps cached search target when the URL target is empty', () => {
    const cachedFilters: Omit<SearchParams, 'query'> = {
      page: 1,
      limit: 20,
      sort: 'date_desc',
      searchTarget: 'exact_match_for_tags',
    }

    expect(createFilterStateFromCachedFilters(cachedFilters, '')).toMatchObject({
      searchTarget: 'exact_match_for_tags',
    })
  })

  it('resolves initial URL hydration and cache reuse decisions outside the component', () => {
    const resolveInitialSearchHydration = (searchPageModel as {
      resolveInitialSearchHydration?: ResolveInitialSearchHydration
    }).resolveInitialSearchHydration
    const currentFilters: SearchFilterState = {
      searchTarget: 'keyword',
      startDate: '',
      endDate: '',
      bookmarkNum: 0,
      bookmarkNumMin: 0,
      bookmarkNumMax: 0,
      textLengthMin: 0,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    }
    const cachedFilters: Omit<SearchParams, 'query'> = {
      page: 1,
      limit: 20,
      sort: 'date_desc',
      searchTarget: 'keyword',
    }

    expect(typeof resolveInitialSearchHydration).toBe('function')
    expect(resolveInitialSearchHydration?.({
      urlState: {
        q: '',
        page: 1,
        sort: 'date_desc',
        target: 'keyword',
      },
      currentFilters,
      cachedFilters,
      cachedQuery: '',
      cachedPage: 1,
      resultCount: 0,
    })).toBeNull()
    expect(resolveInitialSearchHydration?.({
      urlState: {
        q: '五悠',
        page: 1,
        sort: 'date_desc',
        target: 'bad_target',
      },
      currentFilters,
      cachedFilters,
      cachedQuery: '五悠',
      cachedPage: 1,
      resultCount: 1,
    })).toEqual({
      query: '五悠',
      filters: currentFilters,
      shouldSearch: false,
      search: {
        query: '五悠',
        page: 1,
        sort: 'date_desc',
        filters: currentFilters,
      },
    })
    expect(resolveInitialSearchHydration?.({
      urlState: {
        q: '夏五',
        page: 2,
        sort: 'popular_desc',
        target: 'text',
      },
      currentFilters,
      cachedFilters,
      cachedQuery: '五悠',
      cachedPage: 1,
      resultCount: 1,
    })).toMatchObject({
      query: '夏五',
      filters: {
        searchTarget: 'text',
      },
      shouldSearch: true,
      search: {
        query: '夏五',
        page: 2,
        sort: 'popular_desc',
      },
    })
  })

  it('compares cached filters using normalized default values', () => {
    const cachedFilters: Omit<SearchParams, 'query'> = {
      page: 1,
      limit: 20,
      sort: 'date_desc',
      searchTarget: 'bad_target' as SearchParams['searchTarget'],
    }
    const filters: SearchFilterState = {
      searchTarget: 'keyword',
      startDate: '',
      endDate: '',
      bookmarkNum: 0,
      bookmarkNumMin: 0,
      bookmarkNumMax: 0,
      textLengthMin: 0,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    }

    expect(areSearchFiltersEquivalent(cachedFilters, filters)).toBe(true)
  })

  it('resolves executable search state from current page state and overrides', () => {
    const currentFilters: SearchFilterState = {
      searchTarget: 'keyword',
      startDate: '',
      endDate: '',
      bookmarkNum: 0,
      bookmarkNumMin: 0,
      bookmarkNumMax: 0,
      textLengthMin: 0,
      lang: 'ja',
      includePotentialViolationWorks: false,
      includeTranslatedTagResults: true,
      isOriginalOnly: false,
      isReplaceableOnly: false,
      mergePlainKeywordResults: true,
      searchAiType: '1',
    }

    expect(resolveSearchExecution({
      currentQuery: '五悠',
      currentPage: 3,
      currentSort: 'date_desc',
      currentFilters,
      searchQuery: '夏五',
      searchPage: 1,
      searchSort: 'popular_desc',
      filterOverrides: {
        searchTarget: 'text',
        bookmarkNumMin: 100,
      },
    })).toEqual({
      query: '夏五',
      page: 1,
      sort: 'popular_desc',
      filters: {
        ...currentFilters,
        searchTarget: 'text',
        bookmarkNumMin: 100,
      },
      urlState: {
        q: '夏五',
        page: 1,
        sort: 'popular_desc',
        target: 'text',
      },
      storeParams: {
        query: '夏五',
        page: 1,
        sort: 'popular_desc',
        searchTarget: 'text',
        startDate: undefined,
        endDate: undefined,
        bookmarkNum: undefined,
        bookmarkNumMin: 100,
        bookmarkNumMax: undefined,
        textLengthMin: undefined,
        lang: 'ja',
        includePotentialViolationWorks: false,
        includeTranslatedTagResults: true,
        isOriginalOnly: false,
        isReplaceableOnly: false,
        mergePlainKeywordResults: true,
        searchAiType: '1',
      },
    })

    expect(resolveSearchExecution({
      currentQuery: '   ',
      currentPage: 1,
      currentSort: 'date_desc',
      currentFilters,
    })).toBeNull()

    expect(resolveSearchExecution({
      currentQuery: 'x'.repeat(101),
      currentPage: 1,
      currentSort: 'date_desc',
      currentFilters,
    })).toBeNull()
  })
})
