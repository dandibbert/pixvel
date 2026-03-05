import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

type SearchKeywordRulesContextValue = {
  blockedWordsInput: string
  highlightWordsInput: string
  blockedWords: string[]
  highlightWords: string[]
  revealedBlockedIds: ReadonlySet<string>
  setBlockedWordsInput: (value: string) => void
  setHighlightWordsInput: (value: string) => void
  revealBlockedId: (id: string) => void
  resetRevealedBlockedIds: () => void
}

const SearchKeywordRulesContext = createContext<SearchKeywordRulesContextValue | undefined>(
  undefined,
)

function parseKeywordInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((word) => word.trim())
        .filter((word) => word.length > 0),
    ),
  )
}

export function SearchKeywordRulesProvider({ children }: PropsWithChildren) {
  const [blockedWordsInput, setBlockedWordsInputState] = useState('')
  const [highlightWordsInput, setHighlightWordsInputState] = useState('')
  const [revealedBlockedIds, setRevealedBlockedIds] = useState<Set<string>>(new Set())

  const setBlockedWordsInput = useCallback((value: string) => {
    setBlockedWordsInputState(value)
    setRevealedBlockedIds((previous) => (previous.size === 0 ? previous : new Set()))
  }, [])

  const setHighlightWordsInput = useCallback((value: string) => {
    setHighlightWordsInputState(value)
    setRevealedBlockedIds((previous) => (previous.size === 0 ? previous : new Set()))
  }, [])

  const revealBlockedId = useCallback((id: string) => {
    setRevealedBlockedIds((previous) => {
      if (previous.has(id)) return previous
      const next = new Set(previous)
      next.add(id)
      return next
    })
  }, [])

  const resetRevealedBlockedIds = useCallback(() => {
    setRevealedBlockedIds((previous) => (previous.size === 0 ? previous : new Set()))
  }, [])

  const blockedWords = useMemo(() => parseKeywordInput(blockedWordsInput), [blockedWordsInput])
  const highlightWords = useMemo(
    () => parseKeywordInput(highlightWordsInput),
    [highlightWordsInput],
  )

  const value = useMemo<SearchKeywordRulesContextValue>(
    () => ({
      blockedWordsInput,
      highlightWordsInput,
      blockedWords,
      highlightWords,
      revealedBlockedIds,
      setBlockedWordsInput,
      setHighlightWordsInput,
      revealBlockedId,
      resetRevealedBlockedIds,
    }),
    [
      blockedWordsInput,
      highlightWordsInput,
      blockedWords,
      highlightWords,
      revealedBlockedIds,
      setBlockedWordsInput,
      setHighlightWordsInput,
      revealBlockedId,
      resetRevealedBlockedIds,
    ],
  )

  return (
    <SearchKeywordRulesContext.Provider value={value}>
      {children}
    </SearchKeywordRulesContext.Provider>
  )
}

export function useSearchKeywordRules(): SearchKeywordRulesContextValue {
  const context = useContext(SearchKeywordRulesContext)

  if (context === undefined) {
    throw new Error('useSearchKeywordRules must be used within SearchKeywordRulesProvider')
  }

  return context
}
