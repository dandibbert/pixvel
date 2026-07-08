import { describe, expect, it } from 'vitest'
import {
  getPlainNovelDescription,
  shouldShowModalOnlyBadge,
} from './novelCardModel'

describe('novelCardModel', () => {
  it('converts HTML descriptions into trimmed plain text', () => {
    expect(getPlainNovelDescription(' <p>Alpha<br>Beta</p><strong>Gamma</strong> ')).toBe(
      'Alpha BetaGamma',
    )
    expect(getPlainNovelDescription('<br/>Only break<br />')).toBe('Only break')
  })

  it('shows the modal-only badge only when the match has modal highlights without card highlights', () => {
    expect(
      shouldShowModalOnlyBadge({
        hasModalOnlyHighlight: true,
        hasCardHighlight: false,
        isBlocked: false,
        highlightHits: [],
        blockedHits: [],
      }),
    ).toBe(true)

    expect(
      shouldShowModalOnlyBadge({
        hasModalOnlyHighlight: true,
        hasCardHighlight: true,
        isBlocked: false,
        highlightHits: [],
        blockedHits: [],
      }),
    ).toBe(false)

    expect(shouldShowModalOnlyBadge(undefined)).toBe(false)
  })
})
