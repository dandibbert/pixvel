import { describe, expect, it } from 'vitest'
import { resolveReaderNavigationAction } from './novelReaderModel'

const series = {
  id: 'series-1',
  title: 'Series',
  prev_novel: {
    id: 'prev-1',
    title: 'Previous',
  },
  next_novel: {
    id: 'next-1',
    title: 'Next',
  },
}

describe('novelReaderModel', () => {
  it('resolves previous and next commands without coupling callers to page boundary rules', () => {
    expect(resolveReaderNavigationAction({
      direction: 'prev',
      currentPage: 1,
      totalPages: 3,
      series,
    })).toEqual({ type: 'series', novelId: 'prev-1' })

    expect(resolveReaderNavigationAction({
      direction: 'prev',
      currentPage: 2,
      totalPages: 3,
      series,
    })).toEqual({ type: 'page' })

    expect(resolveReaderNavigationAction({
      direction: 'prev',
      currentPage: 1,
      totalPages: 3,
      series: null,
    })).toEqual({ type: 'none' })

    expect(resolveReaderNavigationAction({
      direction: 'next',
      currentPage: 3,
      totalPages: 3,
      series,
    })).toEqual({ type: 'series', novelId: 'next-1' })

    expect(resolveReaderNavigationAction({
      direction: 'next',
      currentPage: 2,
      totalPages: 3,
      series,
    })).toEqual({ type: 'page' })

    expect(resolveReaderNavigationAction({
      direction: 'next',
      currentPage: 1,
      totalPages: 0,
      series,
    })).toEqual({ type: 'series', novelId: 'next-1' })
  })
})
