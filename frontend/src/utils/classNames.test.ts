import { describe, expect, it } from 'vitest'
import { joinClassNames } from './classNames'

describe('class name utilities', () => {
  it('joins present class names while omitting empty optional values', () => {
    expect(joinClassNames(
      'base',
      '',
      false,
      undefined,
      null,
      'active',
    )).toBe('base active')
  })

  it('trims individual class name values before joining', () => {
    expect(joinClassNames('  base  ', '  active state  ')).toBe('base active state')
  })
})
