import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import FilterPanelActions from './FilterPanelActions'
import FilterPanelDrawer from './FilterPanelDrawer'
import FilterPanelHeader from './FilterPanelHeader'
import FilterPanelSwitchSections from './FilterPanelSwitchSections'
import FilterPanelTrigger from './FilterPanelTrigger'
import FilterPanelValidationErrors from './FilterPanelValidationErrors'
import FilterRangeSection from './FilterRangeSection'
import SearchTargetSection from './SearchTargetSection'
import {
  applyFilterPanelValues,
  buildFilterPanelValueChangeHandlers,
  buildFilterPanelValues,
  countActiveSearchFilters,
  DEFAULT_FILTER_PANEL_VALUES,
  type FilterPanelValueChangeHandlers,
  type FilterPanelValues,
  type FilterValidationError,
  validateSearchFilters,
} from './filterPanelModel'

interface FilterPanelProps extends FilterPanelValues, FilterPanelValueChangeHandlers {
  onApply: () => void
}

export default function FilterPanel({
  onApply,
  ...filterPanelProps
}: FilterPanelProps) {
  const { t, searchTargetLabel } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<FilterValidationError[]>([])

  const filterValues = buildFilterPanelValues(filterPanelProps)
  const filterChangeHandlers = buildFilterPanelValueChangeHandlers(filterPanelProps)
  const activeFilterCount = countActiveSearchFilters(filterValues)

  const resetFilters = () => {
    setValidationErrors([])
    applyFilterPanelValues(DEFAULT_FILTER_PANEL_VALUES, filterChangeHandlers)
  }

  const applyFilters = () => {
    const nextValidationErrors = validateSearchFilters(filterValues)

    setValidationErrors(nextValidationErrors)
    if (nextValidationErrors.length > 0) return

    onApply()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <FilterPanelTrigger
        title={t('filter.title')}
        isOpen={isOpen}
        activeFilterCount={activeFilterCount}
        onOpen={() => setIsOpen(true)}
      />

      {isOpen && (
        <FilterPanelDrawer
          title={t('filter.title')}
          onClose={() => setIsOpen(false)}
        >
          <FilterPanelHeader
            title={t('filter.title')}
            closeLabel={t('filter.close')}
            onClose={() => setIsOpen(false)}
          />

          <SearchTargetSection
            title={t('filter.searchMode')}
            searchTarget={filterValues.searchTarget}
            searchTargetLabel={searchTargetLabel}
            onSearchTargetChange={filterChangeHandlers.onSearchTargetChange}
          />

          <FilterRangeSection
            {...filterValues}
            {...filterChangeHandlers}
          />

          <FilterPanelSwitchSections
            contentTitle={t('filter.content')}
            matchingTitle={t('filter.matching')}
            originalOnlyLabel={t('filter.originalOnly')}
            excludeAiLabel={t('filter.excludeAi')}
            includePotentialViolationLabel={t('filter.includePotentialViolation')}
            includeTranslatedTagsLabel={t('filter.includeTranslatedTags')}
            mergePlainKeywordLabel={t('filter.mergePlainKeyword')}
            replaceableOnlyLabel={t('filter.replaceableOnly')}
            {...filterValues}
            {...filterChangeHandlers}
          />

          <FilterPanelValidationErrors
            errors={validationErrors}
            translateError={(error) => t(`filter.${error}`)}
          />

          <FilterPanelActions
            resetLabel={t('filter.reset')}
            applyLabel={t('filter.apply')}
            onReset={resetFilters}
            onApply={applyFilters}
          />
        </FilterPanelDrawer>
      )}
    </div>
  )
}
