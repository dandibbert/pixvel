import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white border-b-2 border-muted sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl md:text-3xl font-extrabold text-primary tracking-tighter hover:scale-105 transition-transform duration-200">
              PixNovel
            </Link>
          </div>

          <nav className="flex items-center space-x-4 md:space-x-8">
            <Link
              to="/search"
              className="text-sm md:text-base font-semibold text-foreground hover:text-primary hover:scale-105 transition-all duration-200 min-h-[44px] flex items-center"
            >
              搜索
            </Link>
            <Link
              to="/history"
              className="text-sm md:text-base font-semibold text-foreground hover:text-primary hover:scale-105 transition-all duration-200 min-h-[44px] flex items-center"
            >
              历史
            </Link>
            <div className="flex items-center pl-2">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary"></div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
