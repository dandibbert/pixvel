import { describe, expect, it } from 'vitest'
import { resolveNovelSeriesNavState } from './novelSeriesNavModel'

const fullSeries = {
  id: 'series-1',
  title: 'Series Title',
  prev_novel: {
    id: 'prev-1',
    title: 'Previous Novel',
  },
  next_novel: {
    id: 'next-1',
    title: 'Next Novel',
  },
}

describe('novelSeriesNavModel', () => {
  it('builds link targets for available previous and next novels', () => {
    expect(resolveNovelSeriesNavState(fullSeries)).toEqual({
      shouldRender: true,
      title: 'Series Title',
      prev: {
        isAvailable: true,
        title: 'Previous Novel',
        path: '/novel/prev-1',
      },
      next: {
        isAvailable: true,
        title: 'Next Novel',
        path: '/novel/next-1',
      },
    })
  })

  it('keeps disabled item state when one side is absent and hides empty series navigation', () => {
    expect(resolveNovelSeriesNavState({
      id: 'series-1',
      title: 'Series Title',
      next_novel: {
        id: 'next-1',
        title: 'Next Novel',
      },
    })).toEqual({
      shouldRender: true,
      title: 'Series Title',
      prev: {
        isAvailable: false,
      },
      next: {
        isAvailable: true,
        title: 'Next Novel',
        path: '/novel/next-1',
      },
    })

    expect(resolveNovelSeriesNavState(null)).toEqual({
      shouldRender: false,
      title: '',
      prev: {
        isAvailable: false,
      },
      next: {
        isAvailable: false,
      },
    })
  })
})
