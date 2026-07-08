import { describe, expect, it } from 'vitest'
import {
  buildReadingHistorySaveErrorLog,
  buildReadingHistoryPositionPayload,
  buildSeriesRequestPathForNovel,
  buildSeriesRequestPath,
  hasSeriesHint,
} from './useNovelDetailModel'

describe('useNovelDetailModel', () => {
  it('builds the series request path with cached series hints', () => {
    expect(
      buildSeriesRequestPath('novel-1', {
        id: 'series-1',
        title: 'Series Title',
      }),
    ).toBe('/novels/novel-1/series?series_id=series-1&series_title=Series+Title')
  })

  it('detects whether a loaded novel has enough series metadata to fetch neighbors', () => {
    expect(hasSeriesHint({ series: { id: 'series-1', title: '' } })).toBe(true)
    expect(hasSeriesHint({ series: { id: '', title: 'Series Title' } })).toBe(false)
    expect(hasSeriesHint({})).toBe(false)
    expect(hasSeriesHint(null)).toBe(false)
  })

  it('builds a series request path only when the loaded novel has a series hint', () => {
    expect(
      buildSeriesRequestPathForNovel('novel-1', {
        series: {
          id: 'series-1',
          title: 'Series Title',
        },
      }),
    ).toBe('/novels/novel-1/series?series_id=series-1&series_title=Series+Title')
    expect(buildSeriesRequestPathForNovel('novel-1', {})).toBeNull()
    expect(buildSeriesRequestPathForNovel('novel-1', null)).toBeNull()
  })

  it('builds the reading history payload with the existing empty-cover fallback', () => {
    expect(
      buildReadingHistoryPositionPayload('novel-1', {
        title: 'Novel Title',
        coverImage: undefined,
      }),
    ).toEqual({
      novelId: 'novel-1',
      position: 0,
      title: 'Novel Title',
      coverUrl: '',
    })
  })

  it('builds a stable reading-history save error log descriptor', () => {
    const error = new Error('Network error')

    expect(buildReadingHistorySaveErrorLog(error)).toEqual({
      label: 'Failed to save reading history:',
      value: error,
    })
  })
})
