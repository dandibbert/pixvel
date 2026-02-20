import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const { user, isAuthenticated, logout, checkStatus } = useAuthStore()

  return {
    user,
    isAuthenticated,
    logout,
    checkStatus,
  }
}
