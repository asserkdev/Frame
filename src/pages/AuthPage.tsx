import { useState } from 'react'
import { useAuth } from '../components/AuthContext'
import { useToast } from '../components/ToastContext'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  
  const { signIn, signUp, signInWithMagicLink, resetPassword } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (resetMode) {
        const { error } = await resetPassword(email)
        if (error) {
          showToast('error', error.message)
        } else {
          showToast('success', 'Password reset email sent!')
          setResetMode(false)
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          showToast('error', error.message)
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          showToast('error', error.message)
        } else {
          showToast('success', 'Check your email for confirmation!')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      showToast('error', 'Please enter your email first')
      return
    }
    setLoading(true)
    try {
      const { error } = await signInWithMagicLink(email)
      if (error) {
        showToast('error', error.message)
      } else {
        setMagicLinkSent(true)
        showToast('success', 'Check your email for the magic link!')
      }
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-success">
            <svg className="auth-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="auth-success-title">Check your email</h2>
            <p className="auth-success-message">
              We sent a magic link to {email}. Click the link in the email to sign in.
            </p>
            <button
              className="auth-submit"
              onClick={() => setMagicLinkSent(false)}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">CAMBRIC</h1>
          <p className="auth-tagline">Frame</p>
          <span className="auth-product-badge">Creator Workspace</span>
        </div>

        {!resetMode ? (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => setMode('signin')}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {mode === 'signup' && (
                  <span className="form-hint">Must be at least 6 characters</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'signin' && (
              <>
                <div className="auth-divider">or</div>
                <button
                  className="auth-submit"
                  onClick={handleMagicLink}
                  disabled={loading}
                  style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                >
                  Send Magic Link
                </button>

                <div className="auth-footer">
                  <a onClick={() => setResetMode(true)} style={{ cursor: 'pointer' }}>
                    Forgot your password?
                  </a>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="auth-back-link" onClick={() => setResetMode(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to sign in
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
