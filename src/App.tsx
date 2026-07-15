import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import { ToastProvider } from './components/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './components/AppLayout'
import { AuthPage } from './pages/AuthPage'
import { IdeasPage } from './pages/IdeasPage'
import { AssetsPage } from './pages/AssetsPage'
import { SchedulePage } from './pages/SchedulePage'
import { isConfigured } from './lib/supabase'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/ideas" replace />
  }

  return <>{children}</>
}

function NotConfiguredPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo" style={{ color: 'var(--color-error)' }}>Configuration Required</h1>
          <p className="auth-tagline">Frame</p>
        </div>
        <div className="auth-success">
          <p className="auth-success-message">
            Supabase credentials are not configured. Please set the following environment variables:
          </p>
          <ul style={{ textAlign: 'left', marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function App() {
  if (!isConfigured) {
    return (
      <BrowserRouter>
        <NotConfiguredPage />
      </BrowserRouter>
    )
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/ideas" replace />} />
                <Route path="ideas" element={<IdeasPage />} />
                <Route path="assets" element={<AssetsPage />} />
                <Route path="schedule" element={<SchedulePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/ideas" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
