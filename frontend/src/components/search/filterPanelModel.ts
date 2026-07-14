import {
  DEFAULT_SEARCH_FILTER_VALUES,
  type SearchAiType,
  type SearchFilterValues,
  type SearchLang,
  type SearchTarget,
} from '../../utils/searchFilters'
import { pickProperties } from '../../utils/object'
import {
  isValidIsoDate,
  parseNumberInput,
} from './filterRangeModel'

export { parseNumberInput } from './filterRangeModel'

export type {
  SearchAiType,
  SearchLang,
  SearchTarget,
}

export type FilterPanelValues = SearchFilterValues

export interface FilterPanelValueChangeHandlers {
  onSearchTargetChange: (target: SearchTarget) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onBookmarkNumChange: (num: number) => void
  onBookmarkNumMinChange: (num: number) => void
  onBookmarkNumMaxChange: (num: number) => void
  onTextLengthMinChange: (num: number) => void
  onLangChange: (lang: SearchLang) => void
  onIncludePotentialViolationWorksChange: (value: boolean) => void
  onIncludeTranslatedTagResultsChange: (value: boolean) => void
  onIsOriginalOnlyChange: (value: boolean) => void
  onIsReplaceableOnlyChange: (value: boolean) => void
  onMergePlainKeywordResultsChange: (value: boolean) => void
  onSearchAiTypeChange: (value: SearchAiType) => void
}

export type FilterValidationError =
  | 'dateFormatInvalid'
  | 'dateRangeInvalid'
  | 'bookmarkRangeInvalid'

type FilterPanelValueKey = keyof FilterPanelValues
type FilterPanelValueChangeHandlerKey = keyof FilterPanelValueChangeHandlers

export const SEARCH_TARGET_OPTIONS: SearchTarget[] = [
  'partial_match_for_tags',
  'exact_match_for_tags',
  'keyword',
  'text',
]

export const FILTER_PANEL_VALUE_KEYS = [
  'searchTarget',
  'startDate',
  'endDate',
  'bookmarkNum',
  'bookmarkNumMin',
  'bookmarkNumMax',
  'textLengthMin',
  'lang',
  'includePotentialViolationWorks',
  'includeTranslatedTagResults',
  'isOriginalOnly',
  'isReplaceableOnly',
  'mergePlainKeywordResults',
  'searchAiType',
] satisfies ReadonlyArray<FilterPanelValueKey>

export const FILTER_PANEL_VALUE_CHANGE_HANDLER_KEYS = [
  'onSearchTargetChange',
  'onStartDateChange',
  'onEndDateChange',
  'onBookmarkNumChange',
  'onBookmarkNumMinChange',
  'onBookmarkNumMaxChange',
  'onTextLengthMinChange',
  'onLangChange',
  'onIncludePotentialViolationWorksChange',
  'onIncludeTranslatedTagResultsChange',
  'onIsOriginalOnlyChange',
  'onIsReplaceableOnlyChange',
  'onMergePlainKeywordResultsChange',
  'onSearchAiTypeChange',
] satisfies ReadonlyArray<FilterPanelValueChangeHandlerKey>

export function buildSearchTargetOptions({
  selectedTarget,
  searchTargetLabel,
}: {
  selectedTarget: SearchTarget
  searchTargetLabel: (target: SearchTarget) => string
}) {
  return SEARCH_TARGET_OPTIONS.map((target) => ({
    target,
    label: searchTargetLabel(target),
    isSelected: target === selectedTarget,
  }))
}

export const DEFAULT_FILTER_PANEL_VALUES = DEFAULT_SEARCH_FILTER_VALUES

export function buildBookmarkMinimumUpdate(value: string) {
  const parsedValue = parseNumberInput(value)

  return {
    bookmarkNum: parsedValue,
    bookmarkNumMin: parsedValue,
  }
}

export function isExcludeAiSwitchChecked(searchAiType: SearchAiType) {
  return searchAiType === '1'
}

export function resolveSearchAiTypeFromExcludeAiChecked(checked: boolean): SearchAiType {
  return checked ? '1' : '0'
}

export function countActiveSearchFilters(values: FilterPanelValues) {
  return [
    values.searchTarget !== DEFAULT_FILTER_PANEL_VALUES.searchTarget,
    Boolean(values.startDate),
    Boolean(values.endDate),
    values.bookmarkNum > 0 || values.bookmarkNumMin > 0,
    values.bookmarkNumMax > 0,
    values.textLengthMin > 0,
    values.lang !== DEFAULT_FILTER_PANEL_VALUES.lang,
    values.includePotentialViolationWorks,
    !values.includeTranslatedTagResults,
    values.isOriginalOnly,
    values.isReplaceableOnly,
    !values.mergePlainKeywordResults,
    values.searchAiType !== DEFAULT_FILTER_PANEL_VALUES.searchAiType,
  ].filter(Boolean).length
}

export function buildFilterPanelValues<T extends FilterPanelValues>(source: T): FilterPanelValues {
  return pickProperties(source, FILTER_PANEL_VALUE_KEYS)
}

export function buildFilterPanelValueChangeHandlers<T extends FilterPanelValueChangeHandlers>(
  source: T,
): FilterPanelValueChangeHandlers {
  return pickProperties(source, FILTER_PANEL_VALUE_CHANGE_HANDLER_KEYS)
}

export function applyFilterPanelValues(
  values: FilterPanelValues,
  handlers: FilterPanelValueChangeHandlers,
) {
  handlers.onSearchTargetChange(values.searchTarget)
  handlers.onStartDateChange(values.startDate)
  handlers.onEndDateChange(values.endDate)
  handlers.onBookmarkNumChange(values.bookmarkNum)
  handlers.onBookmarkNumMinChange(values.bookmarkNumMin)
  handlers.onBookmarkNumMaxChange(values.bookmarkNumMax)
  handlers.onTextLengthMinChange(values.textLengthMin)
  handlers.onLangChange(values.lang)
  handlers.onIncludePotentialViolationWorksChange(values.includePotentialViolationWorks)
  handlers.onIncludeTranslatedTagResultsChange(values.includeTranslatedTagResults)
  handlers.onIsOriginalOnlyChange(values.isOriginalOnly)
  handlers.onIsReplaceableOnlyChange(values.isReplaceableOnly)
  handlers.onMergePlainKeywordResultsChange(values.mergePlainKeywordResults)
  handlers.onSearchAiTypeChange(values.searchAiType)
}

export function validateSearchFilters(values: FilterPanelValues): FilterValidationError[] {
  const validationErrors: FilterValidationError[] = []
  const hasInvalidDate = [values.startDate, values.endDate].some(
    (value) => Boolean(value) && !isValidIsoDate(value),
  )

  if (hasInvalidDate) {
    validationErrors.push('dateFormatInvalid')
  } else if (values.startDate && values.endDate && values.startDate > values.endDate) {
    validationErrors.push('dateRangeInvalid')
  }

  if (
    values.bookmarkNumMax > 0 &&
    (values.bookmarkNumMin || values.bookmarkNum) > values.bookmarkNumMax
  ) {
    validationErrors.push('bookmarkRangeInvalid')
  }

  return validationErrors
}
