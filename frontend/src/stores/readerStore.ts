import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NovelDetail, NovelPage } from '../types/novel'
import { api } from '../utils/api'
import { logErrorDescriptor } from '../utils/errorLog'
import {
  buildClearedReaderLoadState,
  buildFreshReaderLoadState,
  buildNovelPages,
  buildReaderClearErrorState,
  buildReaderPersistSnapshot,
  buildReaderErrorState,
  buildReaderLoadingState,
  type NovelCache,
  type ReaderPersistSnapshot,
} from './readerCache'
import {
  buildReaderLoadErrorLog,
  buildTimestampedReaderCacheHitState,
  buildTimestampedReaderPageChangeState,
  cacheReaderNovelWithTimestamp,
} from './readerStoreModel'
import { READER_ERROR_CODES } from '../pages/readerPageModel'

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

export const useReaderStore = create<ReaderState>()(
  persist<ReaderState, [], [], ReaderPersistSnapshot>(
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
          set(buildReaderLoadingState())

          const { novelCache, cacheOrder } = get()
          const cacheHitState = buildTimestampedReaderCacheHitState({
            novelCache,
            cacheOrder,
            novelId,
            forceRefresh,
          })

          if (cacheHitState) {
            set(cacheHitState)
            return
          }

          // Cache miss or force refresh, fetch from API
          const [novelDetail, contentResponse] = await Promise.all([
            api.get<NovelDetail>(`/novels/${novelId}`),
            api.get<{ content: string; novelId?: number }>(`/novels/${novelId}/content`),
          ])

          if (!contentResponse.content) {
            throw new Error(READER_ERROR_CODES.contentEmpty)
          }

          const pages = buildNovelPages(contentResponse.content)

          // Update cache
          const { novelCache: latestNovelCache, cacheOrder: latestCacheOrder } = get()
          const updatedCache = cacheReaderNovelWithTimestamp({
            novelCache: latestNovelCache,
            cacheOrder: latestCacheOrder,
            novelId,
            novel: novelDetail,
            pages,
          })

          set(buildFreshReaderLoadState({
            novel: novelDetail,
            pages,
            updatedCache,
          }))
        } catch (error) {
          const errorLog = buildReaderLoadErrorLog(error)
          logErrorDescriptor(errorLog)
          set(buildReaderErrorState(error))
        }
      },

      setPage: (page) => {
        const { totalPages, novel, novelCache } = get()
        const pageChange = buildTimestampedReaderPageChangeState({
          page,
          totalPages,
          novelId: novel?.id,
          novelCache,
        })

        if (pageChange) {
          set(pageChange)
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

      clearNovel: () => set(buildClearedReaderLoadState()),

      clearError: () => set(buildReaderClearErrorState()),

      refreshNovel: async () => {
        const { novel } = get()
        if (novel) {
          await get().loadNovel(novel.id, true)
        }
      },
    }),
    {
      name: 'reader-cache-storage',
      partialize: buildReaderPersistSnapshot,
    }
  )
)
