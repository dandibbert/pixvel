import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../utils/api'
import { logErrorDescriptor } from '../utils/errorLog'
import {
  buildAnonymousAuthState,
  buildAuthenticatedAuthState,
  buildAuthClearErrorState,
  buildAuthErrorState,
  buildAuthLoadingState,
  buildAuthLogoutErrorLog,
  buildAuthPersistSnapshot,
  shouldLogAuthLogoutError,
  type AuthStateSnapshot,
  type AuthUser,
} from './authStoreModel'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setupAuth: (refreshToken: string) => Promise<void>
  checkStatus: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], AuthStateSnapshot>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setupAuth: async (refreshToken: string) => {
        try {
          set(buildAuthLoadingState())

          const response = await api.post<{ success: boolean; user: AuthUser }>(
            '/auth/setup',
            { refreshToken }
          )

          set(buildAuthenticatedAuthState(response.user))
        } catch (error) {
          set(buildAuthErrorState(error))
          throw error
        }
      },

      checkStatus: async () => {
        try {
          const response = await api.get<{ authenticated: boolean; user?: AuthUser }>('/auth/status')

          if (response.authenticated && response.user) {
            set(buildAuthenticatedAuthState(response.user))
          } else {
            set(buildAnonymousAuthState())
          }
        } catch (error) {
          set(buildAnonymousAuthState())
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          if (shouldLogAuthLogoutError(error)) {
            const errorLog = buildAuthLogoutErrorLog(error)
            logErrorDescriptor(errorLog)
          }
        } finally {
          set(buildAnonymousAuthState())
        }
      },

      clearError: () => set(buildAuthClearErrorState()),
    }),
    {
      name: 'auth-storage',
      partialize: buildAuthPersistSnapshot,
    }
  )
)
