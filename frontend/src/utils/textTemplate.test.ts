import { describe, expect, it } from 'vitest'
import { formatCountTemplate } from './textTemplate'

describe('textTemplate', () => {
  it('formats count placeholders with the provided number formatter', () => {
    expect(
      formatCountTemplate({
        template: '最近阅读的 {count} 部作品',
        count: 12,
        formatNumber: (value) => `#${value}`,
      }),
    ).toBe('最近阅读的 #12 部作品')
  })
})
