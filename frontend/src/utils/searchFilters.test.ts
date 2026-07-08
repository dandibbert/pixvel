import { describe, expect, it } from 'vitest'
import {
  areSearchFilterValuesEquivalent,
  buildSearchFilterValues,
  DEFAULT_SEARCH_FILTER_VALUES,
  mergeSearchFilterValueOverrides,
  normalizeSearchAiType,
  normalizeSearchLang,
  normalizeSearchTarget,
  resolveSearchTargetOverride,
  SEARCH_FILTER_VALUE_KEYS,
} from './searchFilters'

describe('searchFilters', () => {
  it('exposes shared search filter defaults', () => {
    expect(DEFAULT_SEARCH_FILTER_VALUES).toEqual({
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

  it('exposes the complete search filter value key list', () => {
    expect(SEARCH_FILTER_VALUE_KEYS).toEqual(Object.keys(DEFAULT_SEARCH_FILTER_VALUES))
  })

  it('normalizes unsupported persisted search filter enum values', () => {
    expect(normalizeSearchTarget('exact_match_for_tags')).toBe('exact_match_for_tags')
    expect(normalizeSearchTarget('bad_target')).toBe('keyword')
    expect(normalizeSearchTarget(undefined)).toBe('keyword')

    expect(normalizeSearchLang('zh-CN')).toBe('zh-CN')
    expect(normalizeSearchLang('en')).toBe('ja')

    expect(normalizeSearchAiType('0')).toBe('0')
    expect(normalizeSearchAiType('2')).toBe('1')
  })

  it('resolves URL search target overrides before cached values', () => {
    expect(resolveSearchTargetOverride({
      urlSearchTarget: 'text',
      cachedSearchTarget: 'exact_match_for_tags',
    })).toBe('text')

    expect(resolveSearchTargetOverride({
      urlSearchTarget: '',
      cachedSearchTarget: 'exact_match_for_tags',
    })).toBe('exact_match_for_tags')

    expect(resolveSearchTargetOverride({
      urlSearchTarget: 'stale_target',
      cachedSearchTarget: 'exact_match_for_tags',
    })).toBe('keyword')
  })

  it('builds normalized search filter values from persisted sources', () => {
    expect(buildSearchFilterValues({
      source: {
        searchTarget: 'exact_match_for_tags',
        bookmarkNum: 2500,
        bookmarkNumMin: undefined,
        bookmarkNumMax: 5000,
        lang: 'zh-CN',
        includePotentialViolationWorks: true,
        includeTranslatedTagResults: false,
        searchAiType: '0',
      },
      searchTargetOverride: '',
    })).toEqual({
      ...DEFAULT_SEARCH_FILTER_VALUES,
      searchTarget: 'exact_match_for_tags',
      bookmarkNum: 2500,
      bookmarkNumMin: 2500,
      bookmarkNumMax: 5000,
      lang: 'zh-CN',
      includePotentialViolationWorks: true,
      includeTranslatedTagResults: false,
      searchAiType: '0',
    })

    expect(buildSearchFilterValues({
      source: {
        searchTarget: 'stale_target',
        lang: 'en',
        searchAiType: '2',
      },
      searchTargetOverride: 'text',
    })).toEqual({
      ...DEFAULT_SEARCH_FILTER_VALUES,
      searchTarget: 'text',
    })
  })

  it('compares persisted sources to normalized filter values', () => {
    const source = {
      searchTarget: 'bad_target',
      bookmarkNum: 2500,
      bookmarkNumMin: undefined,
      includeTranslatedTagResults: undefined,
      mergePlainKeywordResults: undefined,
      searchAiType: '2',
    }

    expect(areSearchFilterValuesEquivalent({
      source,
      values: {
        ...DEFAULT_SEARCH_FILTER_VALUES,
        bookmarkNum: 2500,
        bookmarkNumMin: 2500,
      },
    })).toBe(true)

    expect(areSearchFilterValuesEquivalent({
      source,
      values: {
        ...DEFAULT_SEARCH_FILTER_VALUES,
        bookmarkNum: 2500,
        bookmarkNumMin: 1000,
      },
    })).toBe(false)
  })

  it('merges filter value overrides while allowing explicit date clears', () => {
    const currentValues = {
      ...DEFAULT_SEARCH_FILTER_VALUES,
      startDate: '2025-04-26',
      endDate: '2026-04-26',
      bookmarkNumMin: 1000,
      includeTranslatedTagResults: true,
    }

    expect(mergeSearchFilterValueOverrides(currentValues, {
      startDate: undefined,
      endDate: '',
      bookmarkNumMin: undefined,
      includeTranslatedTagResults: false,
    })).toEqual({
      ...currentValues,
      startDate: undefined,
      endDate: '',
      bookmarkNumMin: 1000,
      includeTranslatedTagResults: false,
    })
  })
})
