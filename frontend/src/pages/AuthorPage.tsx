import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import NovelPreviewModal from '../components/novel/NovelPreviewModal'
import { Novel } from '../types/novel'
import { api } from '../utils/api'
import { setDocumentTitle } from '../utils/documentTitle'
import { useI18n } from '../i18n/useI18n'
import { usePagedNovelResource, type PagedNovelResponse } from '../hooks/usePagedNovelResource'
import { useNovelPreview } from '../hooks/useNovelPreview'
import PagedNovelCollectionPage from './PagedNovelCollectionPage'
import {
  buildPagedCollectionDocumentTitle,
  buildPagedCollectionLoadErrorMessage,
  buildPagedCollectionResourceResponse,
  buildPagedCollectionSubtitle,
} from './pagedNovelCollectionModel'

interface AuthorResponse {
  author: {
    id: string
    name: string
    avatar?: string
  }
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export default function AuthorPage() {
  const { t, formatNumber } = useI18n()
  const { id } = useParams()
  const novelPreview = useNovelPreview<Novel>()

  // Latest-ref for t: fetch callbacks must stay referentially stable across
  // locale switches, or the paged-resource effect refetches the whole list.
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  }, [t])

  const fetchAuthorPage = useCallback(async (page: number): Promise<PagedNovelResponse<AuthorResponse['author']>> => {
    if (!id) throw new Error(tRef.current('author.loadErrorFallback'))

    const response = await api.get<AuthorResponse>(`/novels/user/${id}`, {
      page,
    })

    return buildPagedCollectionResourceResponse({
      resource: response.author,
      novels: response.novels,
      page: response.page,
      nextPage: response.nextPage,
      hasMore: response.hasMore,
    })
  }, [id])

  const getAuthorLoadErrorMessage = useCallback((error: unknown) => {
    return buildPagedCollectionLoadErrorMessage(error, tRef.current('author.loadErrorFallback'))
  }, [])

  const {
    resource: author,
    novels,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = usePagedNovelResource({
    resourceId: id,
    fetchPage: fetchAuthorPage,
    getErrorMessage: getAuthorLoadErrorMessage,
  })

  useEffect(() => {
    setDocumentTitle(buildPagedCollectionDocumentTitle({
      resourceTitle: author?.name,
      titleSuffix: t('author.documentTitleSuffix'),
      defaultTitle: t('author.documentTitleDefault'),
    }))
  }, [author?.name, t])

  const handleLoadMore = () => {
    loadMore()
  }

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
        hasMore={hasMore}
        loadingLabel={t('author.loading')}
        loadMoreLabel={t('author.loadMore')}
        emptyLabel={t('author.empty')}
        onNovelClick={novelPreview.openPreview}
        onLoadMore={handleLoadMore}
      />
      <NovelPreviewModal
        {...novelPreview.previewModalProps}
      />
    </>
  )
}
