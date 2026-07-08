import { getErrorMessage } from '../utils/errorLog'

export interface AuthUser {
  id: string
  name: string
  account: string
}

export interface AuthStateSnapshot {
  user: AuthUser | null
  isAuthenticated: boolean
}

export function buildAuthenticatedAuthState(user: AuthUser) {
  return {
    user,
    isAuthenticated: true,
    isLoading: false,
  }
}

export function buildAnonymousAuthState() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
}

export function buildAuthLoadingState() {
  return {
    isLoading: true,
    error: null,
  }
}

export function buildAuthErrorState(error: unknown) {
  return {
    error: getAuthErrorMessage(error),
    isLoading: false,
  }
}

export function buildAuthClearErrorState() {
  return {
    error: null,
  }
}

export function getAuthErrorMessage(error: unknown): string {
  return getErrorMessage(error, 'Authentication failed')
}

export function shouldLogAuthLogoutError(_error: unknown): boolean {
  return true
}

export function buildAuthLogoutErrorLog(error: unknown) {
  return {
    label: 'Logout error:',
    value: error,
  }
}

export function buildAuthPersistSnapshot(state: AuthStateSnapshot): AuthStateSnapshot {
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }
}
