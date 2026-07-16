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

  const isActive = (path: string) => location.pathname.endsWith(path)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      showToast('error', 'Failed to sign out')
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="app">
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-logo">FRAME</h1>
          <p className="sidebar-tagline">Creator Workspace</p>
          <p className="sidebar-made-by">a Cambric product</p>
        </div>

        <div className="sidebar-content">
          <button
            className={`nav-item ${isActive('dashboard') ? 'active' : ''}`}
            onClick={() => { navigate('dashboard'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span className="nav-item-text">Dashboard</span>
          </button>
          <button
            className={`nav-item ${isActive('pipeline') ? 'active' : ''}`}
            onClick={() => { navigate('pipeline'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="nav-item-text">Pipeline</span>
          </button>
          <button
            className={`nav-item ${isActive('projects') ? 'active' : ''}`}
            onClick={() => { navigate('projects'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span className="nav-item-text">Projects</span>
          </button>
          <button
            className={`nav-item ${isActive('series') ? 'active' : ''}`}
            onClick={() => { navigate('series'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span className="nav-item-text">Series</span>
          </button>
          <button
            className={`nav-item ${isActive('calendar') ? 'active' : ''}`}
            onClick={() => { navigate('calendar'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="nav-item-text">Calendar</span>
          </button>
          <button
            className={`nav-item ${isActive('optimizer') ? 'active' : ''}`}
            onClick={() => { navigate('optimizer'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="nav-item-text">Optimizer</span>
          </button>
          <button
            className={`nav-item ${isActive('brand-assets') ? 'active' : ''}`}
            onClick={() => { navigate('brand-assets'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="nav-item-text">Brand Assets</span>
          </button>
          <button
            className={`nav-item ${isActive('trending') ? 'active' : ''}`}
            onClick={() => { navigate('trending'); closeMobileMenu(); }}
          >
            <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="nav-item-text">Trending</span>
          </button>
        </div>

        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-account">
              <div className="sidebar-user">
                <div className="sidebar-user-avatar">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{user.email}</span>
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
          )}
        </div>
      </aside>

      <div className="app-content">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
        {children}
      </div>

      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
