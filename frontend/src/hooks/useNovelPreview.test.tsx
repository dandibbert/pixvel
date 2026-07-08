import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { clickButtonByText, renderReactElement } from '../test/domTestUtils'
import type { Novel } from '../types/novel'

const { useNovelPreview } = await import('./useNovelPreview')

function createNovel(id: string): Novel {
  return {
    id,
    title: `Novel ${id}`,
    description: '',
    author: {
      id: `author-${id}`,
      name: 'Author',
    },
    tags: [],
    pageCount: 1,
    textLength: 1000,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2026-04-26T00:00:00.000Z',
    updatedAt: '2026-04-26T00:00:00.000Z',
  }
}

interface HookSnapshot {
  selectedNovel: Novel | null
  isModalOpen: boolean
  openPreview: (novel: Novel) => void
  closePreview: () => void
  previewModalProps: {
    novel: Novel | null
    isOpen: boolean
    onClose: () => void
  }
}

function renderUseNovelPreview() {
  const snapshots: HookSnapshot[] = []

  function Harness({ label = 'open' }: { label?: string }) {
    const preview = useNovelPreview<Novel>()
    snapshots.push(preview)

    return (
      <button type="button" onClick={() => preview.openPreview(createNovel('first'))}>
        {label}
      </button>
    )
  }

  return { ...renderReactElement(<Harness />), snapshots, Harness }
}

describe('useNovelPreview', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('opens and closes the preview modal for the selected novel', () => {
    const { container, snapshots, unmount } = renderUseNovelPreview()

    expect(snapshots.at(-1)?.selectedNovel).toBeNull()
    expect(snapshots.at(-1)?.isModalOpen).toBe(false)
    expect(snapshots.at(-1)?.previewModalProps).toMatchObject({
      novel: null,
      isOpen: false,
    })

    clickButtonByText(container, 'open')

    expect(snapshots.at(-1)?.selectedNovel?.id).toBe('first')
    expect(snapshots.at(-1)?.isModalOpen).toBe(true)
    expect(snapshots.at(-1)?.previewModalProps.novel?.id).toBe('first')
    expect(snapshots.at(-1)?.previewModalProps.isOpen).toBe(true)

    act(() => {
      snapshots.at(-1)?.previewModalProps.onClose()
    })

    expect(snapshots.at(-1)?.selectedNovel?.id).toBe('first')
    expect(snapshots.at(-1)?.isModalOpen).toBe(false)
    expect(snapshots.at(-1)?.previewModalProps.isOpen).toBe(false)

    unmount()
  })

  it('keeps open and close handlers stable across rerenders', () => {
    const { root, snapshots, Harness, unmount } = renderUseNovelPreview()
    const firstSnapshot = snapshots.at(-1)

    act(() => {
      root.render(<Harness label="rerender" />)
    })

    expect(firstSnapshot?.openPreview).toBe(snapshots.at(-1)?.openPreview)
    expect(firstSnapshot?.closePreview).toBe(snapshots.at(-1)?.closePreview)

    unmount()
  })
})
