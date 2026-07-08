import { describe, expect, it } from 'vitest'
import {
  buildAnonymousAuthState,
  buildAuthenticatedAuthState,
  buildAuthClearErrorState,
  buildAuthErrorState,
  buildAuthLoadingState,
  buildAuthLogoutErrorLog,
  buildAuthPersistSnapshot,
  shouldLogAuthLogoutError,
  getAuthErrorMessage,
  type AuthUser,
} from './authStoreModel'

const user: AuthUser = {
  id: '123',
  name: 'Pixiv User',
  account: 'pixiv_user',
}

describe('authStoreModel', () => {
  it('builds authenticated and anonymous auth state fragments', () => {
    expect(buildAuthenticatedAuthState(user)).toEqual({
      user,
      isAuthenticated: true,
      isLoading: false,
    })

    expect(buildAnonymousAuthState()).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('builds transient setup auth state fragments', () => {
    expect(buildAuthLoadingState()).toEqual({
      isLoading: true,
      error: null,
    })

    expect(buildAuthErrorState(new Error('Invalid token'))).toEqual({
      error: 'Invalid token',
      isLoading: false,
    })
  })

  it('builds the auth clear-error state without changing authentication', () => {
    expect(buildAuthClearErrorState()).toEqual({
      error: null,
    })
  })

  it('normalizes thrown auth errors into display messages', () => {
    expect(getAuthErrorMessage(new Error('Invalid token'))).toBe('Invalid token')
    expect(getAuthErrorMessage('bad token')).toBe('Authentication failed')
  })

  it('logs logout failures because logout still clears local auth state', () => {
    expect(shouldLogAuthLogoutError(new Error('Network error'))).toBe(true)
    expect(shouldLogAuthLogoutError('Network error')).toBe(true)
  })

  it('builds the logout error log descriptor without altering the thrown value', () => {
    const error = new Error('Network error')

    expect(buildAuthLogoutErrorLog(error)).toEqual({
      label: 'Logout error:',
      value: error,
    })
  })

  it('builds the persisted auth snapshot without transient fields', () => {
    expect(buildAuthPersistSnapshot({
      user,
      isAuthenticated: true,
    })).toEqual({
      user,
      isAuthenticated: true,
    })
  })
})
