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
}

export interface SearchHistoryEntry {
  query: string
  sort: 'date_desc' | 'date_asc' | 'popular_desc'
  searchTarget: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
  startDate?: string
  endDate?: string
  bookmarkNum?: number
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
