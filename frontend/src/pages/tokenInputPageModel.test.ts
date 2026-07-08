import { describe, expect, it } from 'vitest'
import {
  buildTokenDocumentTitle,
  getTokenAuthErrorMessage,
  isTokenSubmitDisabled,
} from './tokenInputPageModel'

describe('tokenInputPageModel', () => {
  it('builds the token input document title from the localized default', () => {
    expect(buildTokenDocumentTitle('登录 - Pixvel')).toBe('登录 - Pixvel')
  })

  it('disables submit while loading or when the token is blank after trimming', () => {
    expect(isTokenSubmitDisabled({ isLoading: true, refreshToken: 'token' })).toBe(true)
    expect(isTokenSubmitDisabled({ isLoading: false, refreshToken: '' })).toBe(true)
    expect(isTokenSubmitDisabled({ isLoading: false, refreshToken: '   ' })).toBe(true)
    expect(isTokenSubmitDisabled({ isLoading: false, refreshToken: ' refresh-token ' })).toBe(false)
  })

  it('uses Error messages before falling back to the localized auth message', () => {
    expect(getTokenAuthErrorMessage(new Error('Invalid refresh token'), 'fallback')).toBe('Invalid refresh token')
    expect(getTokenAuthErrorMessage('bad token', 'fallback')).toBe('fallback')
  })
})
