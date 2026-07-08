import { describe, expect, it } from 'vitest'
import { stripHtmlToPlainText } from './htmlText'

describe('htmlText', () => {
  it('strips HTML tags while preserving card-preview spacing behavior by default', () => {
    expect(stripHtmlToPlainText(' <p>Alpha<br>Beta</p><strong>Gamma</strong> ')).toBe(
      'Alpha BetaGamma',
    )
  })

  it('can replace tags with spaces and collapse whitespace for searchable text', () => {
    expect(
      stripHtmlToPlainText(' <p>Alpha<br>Beta</p><strong>Gamma</strong> ', {
        tagReplacement: ' ',
        collapseWhitespace: true,
      }),
    ).toBe('Alpha Beta Gamma')
  })
})
