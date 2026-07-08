import { useCallback, useEffect } from 'react'
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

interface SeriesResponse {
  series: {
    id: string
    title: string
  }
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export default function SeriesPage() {
  const { t, formatNumber } = useI18n()
  const { id } = useParams()
  const novelPreview = useNovelPreview<Novel>()

  const fetchSeriesPage = useCallback(async (page: number): Promise<PagedNovelResponse<SeriesResponse['series']>> => {
    if (!id) throw new Error(t('series.loadErrorFallback'))

    const response = await api.get<SeriesResponse>(`/novels/series/${id}`, {
      page,
    })

    return buildPagedCollectionResourceResponse({
      resource: response.series,
      novels: response.novels,
      page: response.page,
      nextPage: response.nextPage,
      hasMore: response.hasMore,
    })
  }, [id, t])

  const getSeriesLoadErrorMessage = useCallback((error: unknown) => {
    return buildPagedCollectionLoadErrorMessage(error, t('series.loadErrorFallback'))
  }, [t])

  const {
    resource: series,
    novels,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = usePagedNovelResource({
    resourceId: id,
    fetchPage: fetchSeriesPage,
    getErrorMessage: getSeriesLoadErrorMessage,
  })

  useEffect(() => {
    setDocumentTitle(buildPagedCollectionDocumentTitle({
      resourceTitle: series?.title,
      titleSuffix: t('series.documentTitleSuffix'),
      defaultTitle: t('series.documentTitleDefault'),
    }))
  }, [series?.title, t])

  const handleLoadMore = () => {
    loadMore()
  }

  const subtitle = buildPagedCollectionSubtitle({
    count: novels.length,
    loadedTemplate: t('series.subtitleLoaded'),
    defaultSubtitle: t('series.subtitleDefault'),
    formatNumber,
  })

  return (
    <>
      <PagedNovelCollectionPage
        label={t('series.label')}
        title={series?.title || t('series.loadingName')}
        subtitle={subtitle}
        error={error}
        novels={novels}
        isLoading={isLoading}
        hasMore={hasMore}
        loadingLabel={t('series.loading')}
        loadMoreLabel={t('series.loadMore')}
        emptyLabel={t('series.empty')}
        onNovelClick={novelPreview.openPreview}
        onLoadMore={handleLoadMore}
      />
      <NovelPreviewModal
        {...novelPreview.previewModalProps}
      />
    </>
  )
}
