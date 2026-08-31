import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  buildAuthorPagePersistSnapshot,
  cacheAuthorNovelPage,
  createEmptyAuthorPageCache,
  type AuthorNovelPageResponse,
  type AuthorPageCacheSnapshot,
} from './authorPageCache'
import {
  createDebouncedStateStorage,
  registerPageHideFlush,
} from '../utils/debouncedStorage'

interface AuthorPageCacheState extends AuthorPageCacheSnapshot {
  cachePage: (authorId: string, response: AuthorNovelPageResponse) => void
}

export const useAuthorPageStore = create<AuthorPageCacheState>()(
  persist<AuthorPageCacheState, [], [], AuthorPageCacheSnapshot>(
    (set) => ({
      ...createEmptyAuthorPageCache(),
      cachePage: (authorId, response) =>
        set((state) =>
          cacheAuthorNovelPage({
            authorCache: state.authorCache,
            cacheOrder: state.cacheOrder,
            authorId,
            response,
            timestamp: Date.now(),
          })
        ),
    }),
    {
      name: 'author-page-cache-storage',
      version: 1,
      partialize: buildAuthorPagePersistSnapshot,
      storage: createJSONStorage(() =>
        createDebouncedStateStorage(localStorage, {
          registerFlush: registerPageHideFlush,
        })
      ),
    },
  ),
)
