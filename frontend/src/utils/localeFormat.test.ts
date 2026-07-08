import { describe, expect, it } from 'vitest'
import { getIntlLocale } from './localeFormat'

describe('localeFormat', () => {
  it('maps app locales to Intl locale identifiers', () => {
    expect(getIntlLocale('ja')).toBe('ja-JP')
    expect(getIntlLocale('zh')).toBe('zh-CN')
  })
})
