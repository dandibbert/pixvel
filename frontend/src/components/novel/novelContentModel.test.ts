import { describe, expect, it } from 'vitest'
import {
  buildJumpPageLabel,
  resolveNovelContentLinkTarget,
} from './novelContentModel'

describe('novelContentModel', () => {
  it('resolves Pixiv novel links to app novel paths and keeps other links external', () => {
    expect(resolveNovelContentLinkTarget('pixiv://novels/22208150')).toEqual({
      type: 'app-novel',
      href: '/novel/22208150',
    })

    expect(resolveNovelContentLinkTarget('https://example.com/story')).toEqual({
      type: 'external',
      href: 'https://example.com/story',
    })
  })

  it('formats jump page labels consistently for clickable and fallback jump nodes', () => {
    expect(buildJumpPageLabel(3)).toBe('[jump:3]')
    expect(buildJumpPageLabel(undefined)).toBe('[jump:]')
  })
})
