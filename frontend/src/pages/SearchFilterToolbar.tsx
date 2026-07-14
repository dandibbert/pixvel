import FilterPanel from '../components/search/FilterPanel'
import SortControls from '../components/search/SortControls'
import SearchKeywordRulesControl from '../components/search/SearchKeywordRulesControl'
import type { SearchFilterState, SearchSort } from './searchPageModel'

type SearchFilterChangeHandler = <K extends keyof SearchFilterState>(
  name: K,
  value: SearchFilterState[K],
) => void

interface SearchFilterToolbarProps {
  filters: SearchFilterState
  sort: SearchSort
  onFilterChange: SearchFilterChangeHandler
  onApplyFilters: () => void
  onSortChange: (sort: SearchSort) => void
}

export default function SearchFilterToolbar({
  filters,
  sort,
  onFilterChange,
  onApplyFilters,
  onSortChange,
}: SearchFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-between">
      <SortControls value={sort} onChange={onSortChange} />
      <FilterPanel
        searchTarget={filters.searchTarget}
        startDate={filters.startDate || ''}
        endDate={filters.endDate || ''}
        bookmarkNum={filters.bookmarkNum}
        bookmarkNumMin={filters.bookmarkNumMin}
        bookmarkNumMax={filters.bookmarkNumMax}
        textLengthMin={filters.textLengthMin}
        lang={filters.lang}
        includePotentialViolationWorks={filters.includePotentialViolationWorks}
        includeTranslatedTagResults={filters.includeTranslatedTagResults}
        isOriginalOnly={filters.isOriginalOnly}
        isReplaceableOnly={filters.isReplaceableOnly}
        mergePlainKeywordResults={filters.mergePlainKeywordResults}
        searchAiType={filters.searchAiType}
        onSearchTargetChange={(value) => onFilterChange('searchTarget', value)}
        onStartDateChange={(value) => onFilterChange('startDate', value)}
        onEndDateChange={(value) => onFilterChange('endDate', value)}
        onBookmarkNumChange={(value) => onFilterChange('bookmarkNum', value)}
        onBookmarkNumMinChange={(value) => onFilterChange('bookmarkNumMin', value)}
        onBookmarkNumMaxChange={(value) => onFilterChange('bookmarkNumMax', value)}
        onTextLengthMinChange={(value) => onFilterChange('textLengthMin', value)}
        onLangChange={(value) => onFilterChange('lang', value)}
        onIncludePotentialViolationWorksChange={(value) => onFilterChange('includePotentialViolationWorks', value)}
        onIncludeTranslatedTagResultsChange={(value) => onFilterChange('includeTranslatedTagResults', value)}
        onIsOriginalOnlyChange={(value) => onFilterChange('isOriginalOnly', value)}
        onIsReplaceableOnlyChange={(value) => onFilterChange('isReplaceableOnly', value)}
        onMergePlainKeywordResultsChange={(value) => onFilterChange('mergePlainKeywordResults', value)}
        onSearchAiTypeChange={(value) => onFilterChange('searchAiType', value)}
        onApply={onApplyFilters}
      />
      <SearchKeywordRulesControl />
    </div>
  )
}
