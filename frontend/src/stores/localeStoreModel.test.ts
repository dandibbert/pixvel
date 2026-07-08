import { describe, expect, it } from 'vitest'
import {
  buildLocaleSetState,
  buildLocaleToggleState,
  getDefaultLocaleFromLanguage,
} from './localeStoreModel'

describe('localeStoreModel', () => {
  it('uses Japanese for Japanese browser languages and Chinese otherwise', () => {
    expect(getDefaultLocaleFromLanguage('ja')).toBe('ja')
    expect(getDefaultLocaleFromLanguage('ja-JP')).toBe('ja')
    expect(getDefaultLocaleFromLanguage('zh-CN')).toBe('zh')
    expect(getDefaultLocaleFromLanguage(undefined)).toBe('zh')
  })

  it('builds locale state updates', () => {
    expect(buildLocaleSetState('ja')).toEqual({ locale: 'ja' })
    expect(buildLocaleToggleState('zh')).toEqual({ locale: 'ja' })
    expect(buildLocaleToggleState('ja')).toEqual({ locale: 'zh' })
  })
})
