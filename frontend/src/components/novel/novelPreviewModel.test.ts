import { describe, expect, it } from 'vitest'
import { buildNovelPreviewModalViewModel } from './novelPreviewModel'

describe('novelPreviewModel', () => {
  it('builds preview modal paths and unblocked display state by default', () => {
    expect(buildNovelPreviewModalViewModel({
      novelId: 'novel-1',
      keywordMatch: undefined,
    })).toEqual({
      novelPath: '/novel/novel-1',
      authorPath: expect.any(Function),
      seriesPath: expect.any(Function),
      isBlockedForDisplay: false,
      blockedHits: [],
      contentClassName: '',
      isContentHiddenFromAssistiveTech: false,
    })
  })

  it('builds blocked display state from keyword matches', () => {
    const viewModel = buildNovelPreviewModalViewModel({
      novelId: 'novel-2',
      keywordMatch: {
        isBlocked: true,
        blockedHits: ['spoiler', 'mute'],
        highlightHits: ['safe'],
        hasCardHighlight: true,
        hasModalOnlyHighlight: false,
      },
    })

    expect(viewModel.novelPath).toBe('/novel/novel-2')
    expect(viewModel.authorPath('author-1')).toBe('/author/author-1')
    expect(viewModel.seriesPath('series-1')).toBe('/series/series-1')
    expect(viewModel.isBlockedForDisplay).toBe(true)
    expect(viewModel.blockedHits).toEqual(['spoiler', 'mute'])
    expect(viewModel.contentClassName).toBe('pointer-events-none blur-[3px]')
    expect(viewModel.isContentHiddenFromAssistiveTech).toBe(true)
  })
})
