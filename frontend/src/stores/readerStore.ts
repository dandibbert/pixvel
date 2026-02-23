import { create } from 'zustand'
import { NovelDetail, NovelPage } from '../types/novel'
import { api } from '../utils/api'
import { splitByNewpage } from '../utils/novelTextParser'

interface ReaderState {
  novel: NovelDetail | null
  pages: NovelPage[]
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null

  loadNovel: (novelId: string) => Promise<void>
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  clearNovel: () => void
  clearError: () => void
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  novel: null,
  pages: [],
  currentPage: 1,
  totalPages: 0,
  isLoading: false,
  error: null,

  loadNovel: async (novelId) => {
    try {
      set({ isLoading: true, error: null })

      const [novelDetail, contentResponse] = await Promise.all([
        api.get<NovelDetail>(`/novels/${novelId}`),
        api.get<{ content: string; novelId?: number }>(`/novels/${novelId}/content`),
      ])

      // Ensure content exists
      if (!contentResponse.content) {
        throw new Error('ERR_READER_CONTENT_EMPTY')
      }

      const pageTexts = splitByNewpage(contentResponse.content)
      const pages: NovelPage[] = pageTexts.map((text, index) => ({
        page: index + 1,
        content: text,
      }))

      set({
        novel: novelDetail,
        pages,
        totalPages: pages.length,
        currentPage: 1,
        isLoading: false,
      })
    } catch (error) {
      console.error('Load novel error:', error)
      set({
        error: error instanceof Error ? error.message : 'ERR_READER_LOAD_FAILED',
        isLoading: false,
      })
    }
  },

  setPage: (page) => {
    const { totalPages } = get()
    if (page >= 1 && page <= totalPages) {
      set({ currentPage: page })
    }
  },

  nextPage: () => {
    const { currentPage, totalPages } = get()
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 })
    }
  },

  prevPage: () => {
    const { currentPage } = get()
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 })
    }
  },

  clearNovel: () =>
    set({
      novel: null,
      pages: [],
      currentPage: 1,
      totalPages: 0,
    }),

  clearError: () => set({ error: null }),
}))
