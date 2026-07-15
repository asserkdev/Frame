import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { AppError, ErrorCodes, logError, isOffline, onConnectionChange } from '../lib/errors'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  error?: AppError
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: Toast['type'], message: string, error?: AppError) => void
  showError: (error: AppError | Error) => void
  removeToast: (id: string) => void
  showOfflineWarning: () => void
  showOnlineNotification: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// User-friendly error messages
const errorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_REQUIRED]: 'Please sign in to continue',
  [ErrorCodes.AUTH_FAILED]: 'Sign in failed. Please check your credentials',
  [ErrorCodes.AUTH_EXPIRED]: 'Your session expired. Please sign in again',
  [ErrorCodes.SESSION_INVALID]: 'Session invalid. Please sign in again',
  [ErrorCodes.DATA_FETCH_FAILED]: 'Failed to load data. Please try again',
  [ErrorCodes.DATA_SAVE_FAILED]: 'Failed to save. Please try again',
  [ErrorCodes.DATA_DELETE_FAILED]: 'Failed to delete. Please try again',
  [ErrorCodes.DATA_VALIDATION_FAILED]: 'Please check your input and try again',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out. Please try again',
  [ErrorCodes.OFFLINE_ERROR]: 'You appear to be offline',
  [ErrorCodes.SECURITY_VIOLATION]: 'Security check failed. Please try again',
  [ErrorCodes.INPUT_SANITIZATION_FAILED]: 'Invalid input detected',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment',
  [ErrorCodes.NOT_FOUND]: 'Item not found',
}

function getUserFriendlyMessage(error: AppError | Error): string {
  if (error instanceof Error) {
    return errorMessages[error.message] || error.message
  }
  return errorMessages[error.code] || error.message
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [offlineWarningShown, setOfflineWarningShown] = useState(false)

  // Show toast with optional error tracking
  const showToast = useCallback((type: Toast['type'], message: string, error?: AppError) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
    const toast: Toast = { id, type, message, error }
    
    // Log errors for debugging
    if (type === 'error' && error) {
      logError(error, error.context)
    }
    
    setToasts((prev) => [...prev, toast])
    
    // Auto-remove after duration based on type
    const duration = type === 'error' ? 6000 : 4000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  // Convenience method for showing errors
  const showError = useCallback((error: AppError | Error) => {
    const appError = error instanceof Error 
      ? { code: ErrorCodes.UNKNOWN_ERROR, message: error.message, severity: 'medium' as const, timestamp: new Date() }
      : error
    
    const message = getUserFriendlyMessage(appError)
    showToast('error', message, appError)
  }, [showToast])

  // Remove toast manually
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Show offline warning
  const showOfflineWarning = useCallback(() => {
    if (!offlineWarningShown) {
      showToast('warning', 'You are offline. Changes will sync when connected')
      setOfflineWarningShown(true)
    }
  }, [offlineWarningShown, showToast])

  // Show online notification
  const showOnlineNotification = useCallback(() => {
    showToast('success', 'Back online')
    setOfflineWarningShown(false)
  }, [showToast])

  // Monitor connection status
  useEffect(() => {
    const cleanup = onConnectionChange((online) => {
      if (!online) {
        showOfflineWarning()
      } else {
        showOnlineNotification()
      }
    })
    
    // Check initial state
    if (isOffline()) {
      showOfflineWarning()
    }
    
    return cleanup
  }, [showOfflineWarning, showOnlineNotification])

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      showToast, 
      showError,
      removeToast,
      showOfflineWarning,
      showOnlineNotification 
    }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            <span className="toast-message">{toast.message}</span>
            <button
              className="btn btn-icon"
              onClick={() => removeToast(toast.id)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                padding: '4px',
                minWidth: 'auto',
                minHeight: 'auto'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
