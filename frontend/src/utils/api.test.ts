import { describe, expect, it, vi } from 'vitest'
import {
  buildQueryString,
  buildRequestHeaders,
  buildRequestUrl,
  readBrowserAccessToken,
  readAccessToken,
  serializeJsonBody,
} from './api'

function createStorage(getItem: Storage['getItem']): Storage {
  return {
    get length() {
      return 0
    },
    clear: vi.fn(),
    getItem,
    key: vi.fn(() => null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  }
}

describe('api utilities', () => {
  it('serializes query parameters while skipping absent values', () => {
    expect(buildQueryString({
      word: '五 悠',
      page: 2,
      include: false,
      missing: undefined,
      empty: null,
    })).toBe('word=%E4%BA%94+%E6%82%A0&page=2&include=false')

    expect(buildQueryString({ missing: undefined, empty: null })).toBe('')
  })

  it('builds request URLs with encoded query parameters and skips empty values', () => {
    expect(
      buildRequestUrl('/api', '/novels/search', {
        word: '五 悠',
        page: 2,
        include: false,
        missing: undefined,
        empty: null,
      }),
    ).toBe('/api/novels/search?word=%E4%BA%94+%E6%82%A0&page=2&include=false')
  })

  it('builds JSON request headers and appends bearer auth only when a token exists', () => {
    expect(Object.fromEntries(buildRequestHeaders({ 'X-Trace': '1' }, 'token-123'))).toEqual({
      'authorization': 'Bearer token-123',
      'content-type': 'application/json',
      'x-trace': '1',
    })

    expect(Object.fromEntries(buildRequestHeaders(undefined, null))).toEqual({
      'content-type': 'application/json',
    })
  })

  it('serializes defined JSON payloads including falsy values', () => {
    expect(serializeJsonBody(undefined)).toBeUndefined()
    expect(serializeJsonBody(false)).toBe('false')
    expect(serializeJsonBody(0)).toBe('0')
    expect(serializeJsonBody(null)).toBe('null')
    expect(serializeJsonBody({ restrict: 'public' })).toBe('{"restrict":"public"}')
  })

  it('reads access tokens through safe storage semantics', () => {
    expect(readAccessToken(createStorage(() => 'token-123'))).toBe('token-123')
    expect(readAccessToken(createStorage(() => null))).toBeNull()
    expect(
      readAccessToken(
        createStorage(() => {
          throw new Error('storage unavailable')
        }),
      ),
    ).toBeNull()
  })

  it('resolves browser access tokens only when storage is available', () => {
    expect(readBrowserAccessToken(createStorage(() => 'token-123'))).toBe('token-123')
    expect(readBrowserAccessToken(undefined)).toBeNull()
  })
})
