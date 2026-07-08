import type { NovelDetail } from '../types/novel'

type Translate = (key: string) => string

export const READER_ERROR_CODES = {
  contentEmpty: 'ERR_READER_CONTENT_EMPTY',
  loadFailed: 'ERR_READER_LOAD_FAILED',
} as const

export type ReaderErrorCode = (typeof READER_ERROR_CODES)[keyof typeof READER_ERROR_CODES]

interface ReaderInitialLoadingInput {
  isLoading: boolean
  requestedNovelId: string | undefined
  loadedNovel: Pick<NovelDetail, 'id'> | null
}

interface ReaderDocumentTitleInput {
  shouldShowInitialLoading: boolean
  novelTitle: string | undefined
  currentPage: number
  totalPages: number
  error: string | null
  t: Translate
}

export function shouldShowReaderInitialLoading({
  isLoading,
  requestedNovelId,
  loadedNovel,
}: ReaderInitialLoadingInput): boolean {
  return isLoading && (!loadedNovel || loadedNovel.id !== requestedNovelId)
}

export function buildReaderDocumentTitle({
  shouldShowInitialLoading,
  novelTitle,
  currentPage,
  totalPages,
  error,
  t,
}: ReaderDocumentTitleInput): string {
  if (shouldShowInitialLoading) {
    return t('reader.documentTitleLoading')
  }

  if (novelTitle) {
    const pageInfo = totalPages > 0 ? ` (${currentPage}/${totalPages})` : ''
    return `${novelTitle}${pageInfo} - Pixvel`
  }

  if (error) {
    return t('reader.documentTitleError')
  }

  return t('reader.documentTitleDefault')
}

export function resolveReaderErrorMessage(error: string, t: Translate): string {
  if (error === READER_ERROR_CODES.contentEmpty) {
    return t('reader.contentEmptyError')
  }

  if (error === READER_ERROR_CODES.loadFailed) {
    return t('reader.loadFailedError')
  }

  return error
}
