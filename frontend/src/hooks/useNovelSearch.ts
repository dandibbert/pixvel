import { useCallback } from 'react'
import { api } from '../utils/api'
import { Novel } from '../types/novel'

interface SearchFilters {
  word: string
  sort: 'date_desc' | 'date_asc' | 'popular_desc'
  search_target: 'partial_match_for_tags' | 'exact_match_for_tags' | 'text' | 'keyword'
  start_date?: string
  end_date?: string
  bookmark_num?: number
  page: number
}

interface SearchResponse {
  novels: Novel[]
  total: number
  page: number
  totalPages: number
}

export function useNovelSearch() {
  const performSearch = useCallback(async (filters: SearchFilters) => {
    const params: Record<string, string | number> = {
      word: filters.word,
      sort: filters.sort,
      search_target: filters.search_target,
      page: filters.page,
    }

    if (filters.start_date) {
      params.start_date = filters.start_date
    }
    if (filters.end_date) {
      params.end_date = filters.end_date
    }
    if (filters.bookmark_num && filters.bookmark_num > 0) {
      params.bookmark_num = filters.bookmark_num
    }

    const response = await api.get<SearchResponse>('/novels/search', params)
    return response
  }, [])

  return {
    performSearch,
  }
}
