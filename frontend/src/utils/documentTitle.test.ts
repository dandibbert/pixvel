import { describe, expect, it } from 'vitest'
import { setDocumentTitle } from './documentTitle'

describe('documentTitle', () => {
  it('sets the provided document title', () => {
    const target = { title: 'Old title' }

    setDocumentTitle('New title', target)

    expect(target.title).toBe('New title')
  })
})
