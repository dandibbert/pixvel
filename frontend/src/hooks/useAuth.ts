import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const checkStatus = useAuthStore((state) => state.checkStatus)

  return {
    user,
    isAuthenticated,
    logout,
    checkStatus,
  }
}
