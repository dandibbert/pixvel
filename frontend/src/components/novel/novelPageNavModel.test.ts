import { describe, expect, it } from 'vitest'
import { resolveNovelPageNavState } from './novelPageNavModel'

describe('novelPageNavModel', () => {
  it('resolves page and series navigation state at reader boundaries', () => {
    expect(
      resolveNovelPageNavState({
        currentPage: 1,
        totalPages: 3,
        hasPrevSeries: true,
        hasNextSeries: true,
      }),
    ).toEqual({
      isOnFirstPage: true,
      isOnLastPage: false,
      canJumpPrevSeries: true,
      canJumpNextSeries: false,
      isPrevDisabled: false,
      isNextDisabled: false,
    })

    expect(
      resolveNovelPageNavState({
        currentPage: 3,
        totalPages: 3,
        hasPrevSeries: true,
        hasNextSeries: true,
      }),
    ).toEqual({
      isOnFirstPage: false,
      isOnLastPage: true,
      canJumpPrevSeries: false,
      canJumpNextSeries: true,
      isPrevDisabled: false,
      isNextDisabled: false,
    })
  })

  it('disables page navigation only when no series jump is available at the edge', () => {
    expect(
      resolveNovelPageNavState({
        currentPage: 1,
        totalPages: 1,
        hasPrevSeries: false,
        hasNextSeries: false,
      }),
    ).toEqual({
      isOnFirstPage: true,
      isOnLastPage: true,
      canJumpPrevSeries: false,
      canJumpNextSeries: false,
      isPrevDisabled: true,
      isNextDisabled: true,
    })
  })
})
