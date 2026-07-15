import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname.startsWith(path)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      showToast('error', 'Failed to sign out')
    }
  }

  return (
    <div className="app">
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">CAMBRIC</h1>
          <p className="sidebar-tagline">Frame</p>
          <span className="sidebar-product-badge">Creator Workspace</span>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Workspace</div>
            <button
              className={`nav-item ${isActive('/ideas') ? 'active' : ''}`}
              onClick={() => navigate('/ideas')}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="nav-item-text">Ideas</span>
            </button>
            <button
              className={`nav-item ${isActive('/assets') ? 'active' : ''}`}
              onClick={() => navigate('/assets')}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="nav-item-text">Assets</span>
            </button>
            <button
              className={`nav-item ${isActive('/schedule') ? 'active' : ''}`}
              onClick={() => navigate('/schedule')}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="nav-item-text">Schedule</span>
            </button>
          </div>

          <div className="sidebar-section" style={{ marginTop: 'auto' }}>
            <div className="sidebar-section-title">Account</div>
            <div className="nav-item" style={{ cursor: 'default' }}>
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span className="nav-item-text" style={{ fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email?.split('@')[0]}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              className="nav-item"
              onClick={handleSignOut}
            >
              <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="nav-item-text">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="app-content">
        {children}
      </main>

      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{ position: 'fixed', top: 'var(--space-4)', right: 'var(--space-4)', zIndex: 200 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
