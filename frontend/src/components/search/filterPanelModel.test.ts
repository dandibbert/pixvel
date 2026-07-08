import { describe, expect, it, vi } from 'vitest'
import {
  applyFilterPanelValues,
  buildBookmarkMinimumUpdate,
  buildFilterPanelValueChangeHandlers,
  buildFilterPanelValues,
  buildSearchTargetOptions,
  countActiveSearchFilters,
  DEFAULT_FILTER_PANEL_VALUES,
  isExcludeAiSwitchChecked,
  parseNumberInput,
  resolveSearchAiTypeFromExcludeAiChecked,
  SEARCH_TARGET_OPTIONS,
  validateSearchFilters,
} from './filterPanelModel'

describe('filterPanelModel', () => {
  it('exposes the supported search target order used by the panel', () => {
    expect(SEARCH_TARGET_OPTIONS).toEqual([
      'partial_match_for_tags',
      'exact_match_for_tags',
      'keyword',
      'text',
    ])
  })

  it('builds search target option view models with translated labels and selected state', () => {
    expect(
      buildSearchTargetOptions({
        selectedTarget: 'keyword',
        searchTargetLabel: (target) => `label:${target}`,
      }),
    ).toEqual([
      {
        target: 'partial_match_for_tags',
        label: 'label:partial_match_for_tags',
        isSelected: false,
      },
      {
        target: 'exact_match_for_tags',
        label: 'label:exact_match_for_tags',
        isSelected: false,
      },
      {
        target: 'keyword',
        label: 'label:keyword',
        isSelected: true,
      },
      {
        target: 'text',
        label: 'label:text',
        isSelected: false,
      },
    ])
  })

  it('keeps the panel defaults in one reusable object', () => {
    expect(DEFAULT_FILTER_PANEL_VALUES).toEqual({
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

  it('parses number inputs with the same empty and invalid fallback as the component', () => {
    expect(parseNumberInput('')).toBe(0)
    expect(parseNumberInput('abc')).toBe(0)
    expect(parseNumberInput('2500')).toBe(2500)
    expect(parseNumberInput('-5')).toBe(-5)
  })

  it('builds synchronized bookmark minimum updates for legacy and range filters', () => {
    expect(buildBookmarkMinimumUpdate('2500')).toEqual({
      bookmarkNum: 2500,
      bookmarkNumMin: 2500,
    })

    expect(buildBookmarkMinimumUpdate('bad')).toEqual({
      bookmarkNum: 0,
      bookmarkNumMin: 0,
    })
  })

  it('maps the exclude-AI switch state to the Pixiv search AI type filter', () => {
    expect(isExcludeAiSwitchChecked('1')).toBe(true)
    expect(isExcludeAiSwitchChecked('0')).toBe(false)
    expect(resolveSearchAiTypeFromExcludeAiChecked(true)).toBe('1')
    expect(resolveSearchAiTypeFromExcludeAiChecked(false)).toBe('0')
  })

  it('counts filters that differ from the default API state', () => {
    expect(countActiveSearchFilters(DEFAULT_FILTER_PANEL_VALUES)).toBe(0)
    expect(
      countActiveSearchFilters({
        ...DEFAULT_FILTER_PANEL_VALUES,
        searchTarget: 'text',
        startDate: '2026-04-26',
        bookmarkNumMin: 1000,
        includeTranslatedTagResults: false,
        searchAiType: '0',
      }),
    ).toBe(5)
  })

  it('validates date and bookmark ranges without translating messages', () => {
    expect(
      validateSearchFilters({
        ...DEFAULT_FILTER_PANEL_VALUES,
        startDate: '2026-04-26',
        endDate: '2025-04-26',
        bookmarkNumMin: 5000,
        bookmarkNumMax: 1000,
      }),
    ).toEqual(['dateRangeInvalid', 'bookmarkRangeInvalid'])
  })

  it('uses legacy bookmarkNum as the bookmark minimum when validating ranges', () => {
    expect(
      validateSearchFilters({
        ...DEFAULT_FILTER_PANEL_VALUES,
        bookmarkNum: 5000,
        bookmarkNumMax: 1000,
      }),
    ).toEqual(['bookmarkRangeInvalid'])
  })

  it('applies a complete filter value object through the panel change callbacks', () => {
    const values = {
      ...DEFAULT_FILTER_PANEL_VALUES,
      searchTarget: 'text' as const,
      startDate: '2026-04-26',
      endDate: '2026-05-01',
      bookmarkNum: 100,
      bookmarkNumMin: 50,
      bookmarkNumMax: 500,
      textLengthMin: 1200,
      lang: 'zh-CN' as const,
      includePotentialViolationWorks: true,
      includeTranslatedTagResults: false,
      isOriginalOnly: true,
      isReplaceableOnly: true,
      mergePlainKeywordResults: false,
      searchAiType: '0' as const,
    }
    const handlers = {
      onSearchTargetChange: vi.fn(),
      onStartDateChange: vi.fn(),
      onEndDateChange: vi.fn(),
      onBookmarkNumChange: vi.fn(),
      onBookmarkNumMinChange: vi.fn(),
      onBookmarkNumMaxChange: vi.fn(),
      onTextLengthMinChange: vi.fn(),
      onLangChange: vi.fn(),
      onIncludePotentialViolationWorksChange: vi.fn(),
      onIncludeTranslatedTagResultsChange: vi.fn(),
      onIsOriginalOnlyChange: vi.fn(),
      onIsReplaceableOnlyChange: vi.fn(),
      onMergePlainKeywordResultsChange: vi.fn(),
      onSearchAiTypeChange: vi.fn(),
    }

    applyFilterPanelValues(values, handlers)

    expect(handlers.onSearchTargetChange).toHaveBeenCalledWith('text')
    expect(handlers.onStartDateChange).toHaveBeenCalledWith('2026-04-26')
    expect(handlers.onEndDateChange).toHaveBeenCalledWith('2026-05-01')
    expect(handlers.onBookmarkNumChange).toHaveBeenCalledWith(100)
    expect(handlers.onBookmarkNumMinChange).toHaveBeenCalledWith(50)
    expect(handlers.onBookmarkNumMaxChange).toHaveBeenCalledWith(500)
    expect(handlers.onTextLengthMinChange).toHaveBeenCalledWith(1200)
    expect(handlers.onLangChange).toHaveBeenCalledWith('zh-CN')
    expect(handlers.onIncludePotentialViolationWorksChange).toHaveBeenCalledWith(true)
    expect(handlers.onIncludeTranslatedTagResultsChange).toHaveBeenCalledWith(false)
    expect(handlers.onIsOriginalOnlyChange).toHaveBeenCalledWith(true)
    expect(handlers.onIsReplaceableOnlyChange).toHaveBeenCalledWith(true)
    expect(handlers.onMergePlainKeywordResultsChange).toHaveBeenCalledWith(false)
    expect(handlers.onSearchAiTypeChange).toHaveBeenCalledWith('0')
  })

  it('selects filter values and change handlers from combined panel props', () => {
    const handlers = {
      onSearchTargetChange: vi.fn(),
      onStartDateChange: vi.fn(),
      onEndDateChange: vi.fn(),
      onBookmarkNumChange: vi.fn(),
      onBookmarkNumMinChange: vi.fn(),
      onBookmarkNumMaxChange: vi.fn(),
      onTextLengthMinChange: vi.fn(),
      onLangChange: vi.fn(),
      onIncludePotentialViolationWorksChange: vi.fn(),
      onIncludeTranslatedTagResultsChange: vi.fn(),
      onIsOriginalOnlyChange: vi.fn(),
      onIsReplaceableOnlyChange: vi.fn(),
      onMergePlainKeywordResultsChange: vi.fn(),
      onSearchAiTypeChange: vi.fn(),
    }
    const props = {
      ...DEFAULT_FILTER_PANEL_VALUES,
      ...handlers,
      onApply: vi.fn(),
      unrelated: 'ignored',
    }

    expect(buildFilterPanelValues(props)).toEqual(DEFAULT_FILTER_PANEL_VALUES)
    expect(buildFilterPanelValueChangeHandlers(props)).toEqual(handlers)
  })
})
