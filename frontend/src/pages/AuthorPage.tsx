import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import { useI18n } from '../i18n/useI18n'
import { useNovelPreview } from '../hooks/useNovelPreview'
import {
  getKnownAuthorPageCount,
  isAuthorPageCacheFresh,
  normalizeAuthorPage,
  type AuthorNovelPageResponse,
} from '../stores/authorPageCache'
import { useAuthorPageStore } from '../stores/authorPageStore'
import type { Novel } from '../types/novel'
import { api } from '../utils/api'
import { setDocumentTitle } from '../utils/documentTitle'
import { scrollViewportToTop } from '../utils/pageScroll'
import PagedNovelCollectionPage from './PagedNovelCollectionPage'
import {
  buildPagedCollectionDocumentTitle,
  buildPagedCollectionLoadErrorMessage,
  buildPagedCollectionResourceResponse,
  buildPagedCollectionSubtitle,
} from './pagedNovelCollectionModel'

export default function AuthorPage() {
  const { t, formatNumber } = useI18n()
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const novelPreview = useNovelPreview<Novel>()
  const cachedAuthor = useAuthorPageStore((state) => id ? state.authorCache[id] : undefined)
  const cachePage = useAuthorPageStore((state) => state.cachePage)
  const defaultPage = cachedAuthor?.pageOrder[0] ?? 1
  const requestedPage = searchParams.has('page')
    ? Number(searchParams.get('page'))
    : defaultPage
  const currentPage = normalizeAuthorPage(requestedPage)
  const cachedPage = cachedAuthor?.pages[currentPage]
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    if (!id) return
    if (isAuthorPageCacheFresh(cachedPage, Date.now())) {
      setIsLoading(false)
      setError(null)
      return
    }

    let isActive = true

    const loadAuthorPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get<AuthorNovelPageResponse>(`/novels/user/${id}`, {
          page: currentPage,
        })
        if (!isActive) return

        const normalizedResponse = buildPagedCollectionResourceResponse({
          resource: response.author,
          novels: response.novels,
          page: response.page,
          nextPage: response.nextPage,
          hasMore: response.hasMore,
        })
        cachePage(id, {
          author: normalizedResponse.resource,
          novels: normalizedResponse.novels,
          page: normalizedResponse.page,
          nextPage: normalizedResponse.nextPage,
          hasMore: normalizedResponse.hasMore,
        })
      } catch (loadError) {
        if (!isActive) return
        setError(buildPagedCollectionLoadErrorMessage(
          loadError,
          tRef.current('author.loadErrorFallback'),
        ))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadAuthorPage()
    return () => {
      isActive = false
    }
  }, [cachePage, cachedPage, currentPage, id])

  const author = cachedAuthor?.author
  const novels = cachedPage?.novels ?? []
  const totalPages = getKnownAuthorPageCount(cachedAuthor, currentPage)

  useEffect(() => {
    setDocumentTitle(buildPagedCollectionDocumentTitle({
      resourceTitle: author?.name,
      titleSuffix: t('author.documentTitleSuffix'),
      defaultTitle: t('author.documentTitleDefault'),
    }))
  }, [author?.name, t])

  const handlePageChange = useCallback((page: number) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('page', String(page))
      return nextParams
    }, { replace: true })
    scrollViewportToTop()
  }, [setSearchParams])

  const subtitle = buildPagedCollectionSubtitle({
    count: novels.length,
    loadedTemplate: t('author.subtitleLoaded'),
    defaultSubtitle: t('author.subtitleDefault'),
    formatNumber,
  })

  return (
    <>
      <PagedNovelCollectionPage
        label={t('author.label')}
        title={author?.name || t('author.loadingName')}
        subtitle={subtitle}
        error={error}
        novels={novels}
        isLoading={isLoading}
        loadingLabel={t('author.loading')}
        emptyLabel={t('author.empty')}
        onNovelClick={novelPreview.openPreview}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: handlePageChange,
        }}
      />
      <NovelPreviewModal {...novelPreview.previewModalProps} />
    </>
  )
}
