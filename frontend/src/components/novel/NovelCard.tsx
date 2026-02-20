import { useNavigate } from 'react-router-dom'
import { Novel } from '../../types/novel'

interface NovelCardProps {
  novel: Novel
  onClick: () => void
}

export default function NovelCard({ novel, onClick }: NovelCardProps) {
  const navigate = useNavigate()
  // Simple HTML strip function
  const getPlainDescription = (html: string) => {
    // Replace <br> with space, then remove all tags
    return html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  const plainDescription = getPlainDescription(novel.description);

  return (
    <div
      onClick={onClick}
      className="bg-muted rounded-lg overflow-hidden transition-all duration-200 cursor-pointer touch-manipulation group flex flex-col h-full hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header: Title & Author */}
        <div className="flex-shrink-0 space-y-3">
          <div className="min-h-[32px] flex items-center">
            {novel.series?.title && novel.series.id ? (
              <button
                type="button"
                className="max-w-full text-[11px] font-black uppercase tracking-[0.25em] text-white bg-primary px-3 py-1.5 rounded-md shadow-sm truncate hover:scale-[1.02] active:scale-[0.98] transition-all"
                title={`系列: ${novel.series.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/series/${novel.series?.id}`)
                }}
              >
                系列: {novel.series.title}
              </button>
            ) : (
              <span className="inline-block h-[28px]" />
            )}
          </div>
          <h3 className="text-2xl font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tighter">
            {novel.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-1 rounded-md hover:bg-primary hover:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/author/${novel.author.id}`)
              }}
            >
              {novel.author.name}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 min-h-[1.75rem] flex-shrink-0">
          {novel.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-white text-primary text-xs rounded-md font-bold hover:bg-primary hover:text-white transition-all duration-200"
            >
              #{tag}
            </span>
          ))}
          {novel.tags.length > 4 && (
             <span className="px-2 py-1 bg-white/50 text-foreground/40 text-xs rounded-md font-bold">+ {novel.tags.length - 4}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/60 line-clamp-3 leading-relaxed h-[4.5rem] flex-shrink-0 font-medium">
          {plainDescription || '暂无简介'}
        </p>

        {/* Footer: Stats */}
        <div className="flex items-center justify-between pt-4 mt-auto flex-shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold text-foreground/40">
             <span className="flex items-center gap-1.5 group-hover:text-primary transition-colors" title="收藏数">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
               </svg>
               {novel.totalBookmarks.toLocaleString()}
             </span>
             <span className="flex items-center gap-1.5" title="字数">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
               </svg>
               {novel.textLength.toLocaleString()}
             </span>
          </div>
          <span className="bg-primary text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
            {novel.pageCount}P
          </span>
        </div>
      </div>
    </div>
  )
}
