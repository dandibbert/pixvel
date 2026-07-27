import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Layout from './components/layout/Layout'
import { useAuthStore } from './stores/authStore'

const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const TokenInputPage = lazy(() => import('./pages/TokenInputPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ListPage = lazy(() => import('./pages/ListPage'))
const ReaderPage = lazy(() => import('./pages/ReaderPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SeriesPage = lazy(() => import('./pages/SeriesPage'))
const AuthorPage = lazy(() => import('./pages/AuthorPage'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const checkStatus = useAuthStore((state) => state.checkStatus)

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const checkStatus = useAuthStore((state) => state.checkStatus)

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  if (isAuthenticated) {
    return <Navigate to="/history" replace />
  }

  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <WelcomePage />
      </PublicRoute>
    ),
  },
  {
    path: '/setup',
    element: (
      <PublicRoute>
        <TokenInputPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'search',
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'list',
        element: (
          <ProtectedRoute>
            <ListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'series/:id',
        element: (
          <ProtectedRoute>
            <SeriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'author/:id',
        element: (
          <ProtectedRoute>
            <AuthorPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/novel/:id',
    element: (
      <ProtectedRoute>
        <ReaderPage />
      </ProtectedRoute>
    ),
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
