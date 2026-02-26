import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NovelDetail, NovelPage } from '../types/novel'
import { api } from '../utils/api'
import { splitByNewpage } from '../utils/novelTextParser'

interface CachedNovel {
  novel: NovelDetail
  pages: NovelPage[]
  currentPage: number
  timestamp: number
}

interface NovelCache {
  [novelId: string]: CachedNovel
}

interface ReaderState {
  novel: NovelDetail | null
  pages: NovelPage[]
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null

  // Cache related
  novelCache: NovelCache
  cacheOrder: string[]

  loadNovel: (novelId: string, forceRefresh?: boolean) => Promise<void>
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  clearNovel: () => void
  clearError: () => void
  refreshNovel: () => Promise<void>
}

const MAX_CACHE_SIZE = 20

// Update cache order (LRU)
const updateCacheOrder = (cacheOrder: string[], novelId: string): string[] => {
  const filtered = cacheOrder.filter(id => id !== novelId)
  return [novelId, ...filtered]
}

// Evict oldest cache
const evictOldestCache = (novelCache: NovelCache, cacheOrder: string[]): { novelCache: NovelCache; cacheOrder: string[] } => {
  if (cacheOrder.length <= MAX_CACHE_SIZE) {
    return { novelCache, cacheOrder }
  }

  const oldestId = cacheOrder[cacheOrder.length - 1]
  const newCache = { ...novelCache }
  delete newCache[oldestId]
  const newOrder = cacheOrder.slice(0, -1)

  return { novelCache: newCache, cacheOrder: newOrder }
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      novel: null,
      pages: [],
      currentPage: 1,
      totalPages: 0,
      isLoading: false,
      error: null,
      novelCache: {},
      cacheOrder: [],

      loadNovel: async (novelId, forceRefresh = false) => {
        try {
          set({ isLoading: true, error: null })

          // Check cache (unless force refresh)
          if (!forceRefresh) {
            const { novelCache, cacheOrder } = get()
            const cached = novelCache[novelId]

            if (cached) {
              // Cache hit, use cached data
              set({
                novel: cached.novel,
                pages: cached.pages,
                currentPage: cached.currentPage,
                totalPages: cached.pages.length,
                isLoading: false,
                cacheOrder: updateCacheOrder(cacheOrder, novelId),
                novelCache: {
                  ...novelCache,
                  [novelId]: { ...cached, timestamp: Date.now() }
                }
              })
              return
            }
          }

          // Cache miss or force refresh, fetch from API
          const [novelDetail, contentResponse] = await Promise.all([
            api.get<NovelDetail>(`/novels/${novelId}`),
            api.get<{ content: string; novelId?: number }>(`/novels/${novelId}/content`),
          ])

          if (!contentResponse.content) {
            throw new Error('ERR_READER_CONTENT_EMPTY')
          }

          const pageTexts = splitByNewpage(contentResponse.content)
          const pages: NovelPage[] = pageTexts.map((text, index) => ({
            page: index + 1,
            content: text,
          }))

          // Update cache
          const { novelCache, cacheOrder } = get()
          const newCacheOrder = updateCacheOrder(cacheOrder, novelId)
          const newCachedNovel: CachedNovel = {
            novel: novelDetail,
            pages,
            currentPage: 1,
            timestamp: Date.now()
          }

          let updatedCache = {
            ...novelCache,
            [novelId]: newCachedNovel
          }
          let updatedOrder = newCacheOrder

          // Evict old cache if needed
          if (updatedOrder.length > MAX_CACHE_SIZE) {
            const evicted = evictOldestCache(updatedCache, updatedOrder)
            updatedCache = evicted.novelCache
            updatedOrder = evicted.cacheOrder
          }

          set({
            novel: novelDetail,
            pages,
            totalPages: pages.length,
            currentPage: 1,
            isLoading: false,
            novelCache: updatedCache,
            cacheOrder: updatedOrder
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
        const { totalPages, novel } = get()
        if (page >= 1 && page <= totalPages) {
          set({ currentPage: page })

          // Update reading progress in cache
          if (novel) {
            const { novelCache } = get()
            const cached = novelCache[novel.id]
            if (cached) {
              set({
                novelCache: {
                  ...novelCache,
                  [novel.id]: { ...cached, currentPage: page, timestamp: Date.now() }
                }
              })
            }
          }
        }
      },

      nextPage: () => {
        const { currentPage, totalPages } = get()
        if (currentPage < totalPages) {
          get().setPage(currentPage + 1)
        }
      },

      prevPage: () => {
        const { currentPage } = get()
        if (currentPage > 1) {
          get().setPage(currentPage - 1)
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

      refreshNovel: async () => {
        const { novel } = get()
        if (novel) {
          await get().loadNovel(novel.id, true)
        }
      },
    }),
    {
      name: 'reader-cache-storage',
      partialize: (state) => ({
        novelCache: state.novelCache,
        cacheOrder: state.cacheOrder,
      }),
    }
  )
)
