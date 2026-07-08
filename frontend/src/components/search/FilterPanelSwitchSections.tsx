import {
  isExcludeAiSwitchChecked,
  resolveSearchAiTypeFromExcludeAiChecked,
  type SearchAiType,
} from './filterPanelModel'
import FilterSwitchGroup from './FilterSwitchGroup'

interface FilterPanelSwitchSectionsProps {
  contentTitle: string
  matchingTitle: string
  originalOnlyLabel: string
  excludeAiLabel: string
  includePotentialViolationLabel: string
  includeTranslatedTagsLabel: string
  mergePlainKeywordLabel: string
  replaceableOnlyLabel: string
  includePotentialViolationWorks: boolean
  includeTranslatedTagResults: boolean
  isOriginalOnly: boolean
  isReplaceableOnly: boolean
  mergePlainKeywordResults: boolean
  searchAiType: SearchAiType
  onIncludePotentialViolationWorksChange: (value: boolean) => void
  onIncludeTranslatedTagResultsChange: (value: boolean) => void
  onIsOriginalOnlyChange: (value: boolean) => void
  onIsReplaceableOnlyChange: (value: boolean) => void
  onMergePlainKeywordResultsChange: (value: boolean) => void
  onSearchAiTypeChange: (value: SearchAiType) => void
}

export default function FilterPanelSwitchSections({
  contentTitle,
  matchingTitle,
  originalOnlyLabel,
  excludeAiLabel,
  includePotentialViolationLabel,
  includeTranslatedTagsLabel,
  mergePlainKeywordLabel,
  replaceableOnlyLabel,
  includePotentialViolationWorks,
  includeTranslatedTagResults,
  isOriginalOnly,
  isReplaceableOnly,
  mergePlainKeywordResults,
  searchAiType,
  onIncludePotentialViolationWorksChange,
  onIncludeTranslatedTagResultsChange,
  onIsOriginalOnlyChange,
  onIsReplaceableOnlyChange,
  onMergePlainKeywordResultsChange,
  onSearchAiTypeChange,
}: FilterPanelSwitchSectionsProps) {
  return (
    <>
      <FilterSwitchGroup
        title={contentTitle}
        switches={[
          {
            label: originalOnlyLabel,
            checked: isOriginalOnly,
            onChange: onIsOriginalOnlyChange,
          },
          {
            label: excludeAiLabel,
            checked: isExcludeAiSwitchChecked(searchAiType),
            onChange: (checked) => onSearchAiTypeChange(resolveSearchAiTypeFromExcludeAiChecked(checked)),
          },
          {
            label: includePotentialViolationLabel,
            checked: includePotentialViolationWorks,
            onChange: onIncludePotentialViolationWorksChange,
          },
        ]}
      />

      <FilterSwitchGroup
        title={matchingTitle}
        switches={[
          {
            label: includeTranslatedTagsLabel,
            checked: includeTranslatedTagResults,
            onChange: onIncludeTranslatedTagResultsChange,
          },
          {
            label: mergePlainKeywordLabel,
            checked: mergePlainKeywordResults,
            onChange: onMergePlainKeywordResultsChange,
          },
          {
            label: replaceableOnlyLabel,
            checked: isReplaceableOnly,
            onChange: onIsReplaceableOnlyChange,
          },
        ]}
      />
    </>
  )
}
