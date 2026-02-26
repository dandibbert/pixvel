import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NovelDetail } from '../../types/novel'

interface NovelHeaderProps {
  novel: NovelDetail
  onTitleClick?: () => void
  onRefresh?: () => void
}

export default function NovelHeader({ novel, onTitleClick, onRefresh }: NovelHeaderProps) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  return (
    <header 
      className={`sticky top-0 z-50 bg-white border-b-2 border-muted px-4 py-2 md:px-8 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1
            className="text-sm md:text-base font-black text-foreground truncate leading-tight tracking-tight cursor-pointer hover:text-primary transition-colors"
            onClick={onTitleClick}
          >
            {novel.title}
          </h1>
          <button
            className="text-[10px] font-black text-primary uppercase tracking-widest truncate hover:text-primary/70 transition-colors"
            onClick={() => navigate(`/author/${novel.author.id}`)}
          >
            {novel.author.name}
          </button>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        <button 
          onClick={() => navigate('/')}
          className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
    </header>
  )
}
