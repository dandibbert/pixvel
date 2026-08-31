import { EmptyPageState, LoadingPageState } from '../components/common/PageState'
import Pagination from '../components/common/Pagination'
import NovelGrid from '../components/novel/NovelGrid'
import type { Novel } from '../types/novel'

interface PagedNovelCollectionPageProps {
  label: string
  title: string
  subtitle: string
  error: string | null
  novels: Novel[]
  isLoading: boolean
  hasMore?: boolean
  loadingLabel: string
  loadMoreLabel?: string
  emptyLabel: string
  onNovelClick: (novel: Novel) => void
  onLoadMore?: () => void
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
}

export default function PagedNovelCollectionPage({
  label,
  title,
  subtitle,
  error,
  novels,
  isLoading,
  hasMore,
  loadingLabel,
  loadMoreLabel,
  emptyLabel,
  onNovelClick,
  onLoadMore,
  pagination,
}: PagedNovelCollectionPageProps) {
  return (
    <div className="min-h-screen">
      <div className="bg-primary pt-12 pb-16 md:pt-20 md:pb-32 px-4 mb-[-2.5rem] md:mb-[-4rem]">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
          <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-white/80 text-sm md:text-lg font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl p-4 md:p-8 border border-border/50 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-6 p-4 md:p-6 bg-accent/10 border-l-4 border-accent rounded-r-lg">
              <p className="text-accent font-bold text-base md:text-lg">{error}</p>
            </div>
          )}

          {isLoading && novels.length === 0 ? (
            <LoadingPageState label={loadingLabel} />
          ) : novels.length > 0 ? (
            <>
              <NovelGrid novels={novels} onNovelClick={onNovelClick} />
              {!pagination && hasMore && onLoadMore && loadMoreLabel ? (
                <div className="mt-8 md:mt-12 flex justify-center">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoading}
                    className="h-12 md:h-14 px-8 md:px-10 bg-primary text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isLoading ? loadingLabel : loadMoreLabel}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyPageState label={emptyLabel} icon="book" />
          )}
          {pagination && pagination.totalPages > 1 && !(isLoading && novels.length === 0) && (
            <div className="mt-12 md:mt-16">
              <Pagination {...pagination} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
