export interface SearchParams {
  query: string
  page?: number
  limit?: number
  sort?: 'date_desc' | 'date_asc' | 'popular_desc'
  tags?: string[]
  authorId?: string
  searchTarget?: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
  startDate?: string
  endDate?: string
  bookmarkNum?: number
  bookmarkNumMin?: number
  bookmarkNumMax?: number
  textLengthMin?: number
  lang?: 'ja' | 'zh-CN'
  includePotentialViolationWorks?: boolean
  includeTranslatedTagResults?: boolean
  isOriginalOnly?: boolean
  isReplaceableOnly?: boolean
  mergePlainKeywordResults?: boolean
  searchAiType?: '0' | '1'
}

export interface SearchHistoryEntry {
  query: string
  sort: 'date_desc' | 'date_asc' | 'popular_desc'
  searchTarget: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
  startDate?: string
  endDate?: string
  bookmarkNum?: number
  bookmarkNumMin?: number
  bookmarkNumMax?: number
  textLengthMin?: number
  lang?: 'ja' | 'zh-CN'
  includePotentialViolationWorks?: boolean
  includeTranslatedTagResults?: boolean
  isOriginalOnly?: boolean
  isReplaceableOnly?: boolean
  mergePlainKeywordResults?: boolean
  searchAiType?: '0' | '1'
  timestamp: number
}

export interface SearchResult {
  novels: Novel[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface Novel {
  id: string
  title: string
  description: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  coverImage?: string
  tags: string[]
  pageCount: number
  textLength: number
  totalBookmarks: number
  totalViews: number
  createdAt: string
  updatedAt: string
  series?: {
    id: string
    title: string
  }
}

export interface NovelKeywordCorpus {
  all: string
  card: string
  modal: string
}

export interface NovelKeywordMatchResult {
  isBlocked: boolean
  blockedHits: string[]
  highlightHits: string[]
  hasCardHighlight: boolean
  hasModalOnlyHighlight: boolean
}
