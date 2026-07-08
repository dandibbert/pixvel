import { useCallback, useMemo, useState } from 'react'

export interface NovelPreviewBaseProps<TNovel> {
  novel: TNovel | null
  isOpen: boolean
  onClose: () => void
}

export function useNovelPreview<TNovel>() {
  const [selectedNovel, setSelectedNovel] = useState<TNovel | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openPreview = useCallback((novel: TNovel) => {
    setSelectedNovel(novel)
    setIsModalOpen(true)
  }, [])

  const closePreview = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const previewModalProps = useMemo<NovelPreviewBaseProps<TNovel>>(() => ({
    novel: selectedNovel,
    isOpen: isModalOpen,
    onClose: closePreview,
  }), [selectedNovel, isModalOpen, closePreview])

  return {
    selectedNovel,
    isModalOpen,
    openPreview,
    closePreview,
    previewModalProps,
  }
}
