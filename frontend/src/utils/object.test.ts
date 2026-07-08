import { describe, expect, it } from 'vitest'
import { hasOwnProperty, mapItemsToObject, mapKeysToObject, pickProperties } from './object'

describe('object utilities', () => {
  it('detects own properties even when their value is undefined', () => {
    expect(hasOwnProperty({ clearable: undefined }, 'clearable')).toBe(true)
  })

  it('ignores properties inherited through the prototype chain', () => {
    const object = Object.create({ inherited: true }) as Record<string, unknown>

    expect(hasOwnProperty(object, 'inherited')).toBe(false)
  })

  it('picks requested properties while preserving undefined values', () => {
    const source = {
      query: '五悠',
      page: 2,
      startDate: undefined,
      ignored: true,
    }

    expect(pickProperties(source, ['query', 'startDate'])).toEqual({
      query: '五悠',
      startDate: undefined,
    })
  })

  it('maps property keys to object values while preserving undefined values', () => {
    const source = {
      query: '五悠',
      page: 2,
      startDate: undefined,
    }

    expect(mapKeysToObject(['query', 'startDate'], (key) => source[key])).toEqual({
      query: '五悠',
      startDate: undefined,
    })
  })

  it('maps items to object entries by computed key and value', () => {
    const items = [
      { id: 'first', count: 1 },
      { id: 'second', count: 2 },
    ]

    expect(mapItemsToObject(items, (item) => [item.id, item.count * 10])).toEqual({
      first: 10,
      second: 20,
    })
  })
})
