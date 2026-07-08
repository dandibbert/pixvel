import { describe, expect, it } from 'vitest'
import {
  buildURLState,
  buildUpdatedURLSearchParams,
  parseURLStateValue,
} from './useURLStateModel'

describe('useURLStateModel', () => {
  it('parses URL values based on default value types', () => {
    expect(parseURLStateValue('42', 1)).toBe(42)
    expect(parseURLStateValue('  ', 1)).toBe(1)
    expect(parseURLStateValue('abc', 1)).toBe(1)
    expect(parseURLStateValue('true', false)).toBe(true)
    expect(parseURLStateValue('false', true)).toBe(false)
    expect(parseURLStateValue('maybe', true)).toBe(true)
    expect(parseURLStateValue('五悠', '')).toBe('五悠')
  })

  it('builds typed state from URL search params and defaults', () => {
    expect(
      buildURLState(new URLSearchParams('page=3&enabled=true&query=%E4%BA%94%E6%82%A0'), {
        page: 1,
        enabled: false,
        query: '',
      }),
    ).toEqual({
      page: 3,
      enabled: true,
      query: '五悠',
    })
  })

  it('updates search params while preserving unrelated values and deleting empty updates', () => {
    const nextParams = buildUpdatedURLSearchParams(
      new URLSearchParams('page=2&query=old&keep=yes'),
      {
        page: 3,
        query: '',
        enabled: false,
      },
    )

    expect(nextParams.toString()).toBe('page=3&keep=yes&enabled=false')
  })
})
