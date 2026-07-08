import { describe, expect, it } from 'vitest'
import { compactTrimmedStrings } from './stringList'

describe('stringList', () => {
  it('trims string segments and drops absent or empty values', () => {
    expect(compactTrimmedStrings(['  alpha  ', '', '  ', undefined, null, 'beta gamma'])).toEqual([
      'alpha',
      'beta gamma',
    ])
  })
})
