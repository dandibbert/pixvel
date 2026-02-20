import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import WelcomePage from './pages/WelcomePage'
import TokenInputPage from './pages/TokenInputPage'
import SearchPage from './pages/SearchPage'
import ListPage from './pages/ListPage'
import ReaderPage from './pages/ReaderPage'
import HistoryPage from './pages/HistoryPage'
import SeriesPage from './pages/SeriesPage'
import AuthorPage from './pages/AuthorPage'
import { useAuthStore } from './stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkStatus } = useAuthStore()

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkStatus } = useAuthStore()

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  if (isAuthenticated) {
    return <Navigate to="/history" replace />
  }

  return <>{children}</>
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
