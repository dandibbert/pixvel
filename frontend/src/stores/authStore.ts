import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../utils/api'

interface User {
  id: string
  name: string
  account: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setupAuth: (refreshToken: string) => Promise<void>
  checkStatus: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setupAuth: async (refreshToken: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await api.post<{ success: boolean; user: User }>(
            '/auth/setup',
            { refreshToken }
          )

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Authentication failed',
            isLoading: false,
          })
          throw error
        }
      },

      checkStatus: async () => {
        try {
          const response = await api.get<{ authenticated: boolean; user?: User }>('/auth/status')

          if (response.authenticated && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
            })
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
