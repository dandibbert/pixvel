import { Outlet } from 'react-router-dom'
import { SearchKeywordRulesProvider } from '../../contexts/SearchKeywordRulesContext'
import Header from './Header'

export default function Layout() {
  return (
    <SearchKeywordRulesProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SearchKeywordRulesProvider>
  )
}
