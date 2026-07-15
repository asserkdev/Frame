// ========================================
// FRAME ERROR HANDLING & SECURITY
// High-level security for daily professional users
// ========================================

export interface AppError {
  code: string
  message: string
  details?: string
  severity: 'low' | 'medium' | 'high'
  timestamp: Date
  context?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Error codes for Frame
export const ErrorCodes = {
  // Auth errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  SESSION_INVALID: 'SESSION_INVALID',
  
  // Data errors
  DATA_FETCH_FAILED: 'DATA_FETCH_FAILED',
  DATA_SAVE_FAILED: 'DATA_SAVE_FAILED',
  DATA_DELETE_FAILED: 'DATA_DELETE_FAILED',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
  
  // Security errors
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  INPUT_SANITIZATION_FAILED: 'INPUT_SANITIZATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// Create structured error
export function createError(
  code: ErrorCode,
  message: string,
  severity: AppError['severity'] = 'medium',
  context?: string,
  details?: string
): AppError {
  return {
    code,
    message,
    severity,
    timestamp: new Date(),
    context,
    details,
  }
}

// Map Supabase errors to App errors
export function mapSupabaseError(error: any, context?: string): AppError {
  const errorMessage = error?.message || 'Unknown database error'
  
  if (errorMessage.includes('JWT')) {
    return createError(
      ErrorCodes.AUTH_EXPIRED,
      'Your session has expired. Please sign in again.',
      'high',
      context,
      errorMessage
    )
  }
  
  if (errorMessage.includes('violates')) {
    return createError(
      ErrorCodes.SECURITY_VIOLATION,
      'Data validation failed. Please check your input.',
      'medium',
      context,
      errorMessage
    )
  }
  
  if (errorMessage.includes('network') || error?.code === 'NETWORK_ERROR') {
    return createError(
      ErrorCodes.NETWORK_ERROR,
      'Network error. Please check your connection.',
      'high',
      context,
      errorMessage
    )
  }
  
  if (error?.code === 'PGRST204' || errorMessage.includes('not found')) {
    return createError(
      ErrorCodes.NOT_FOUND,
      'The requested resource was not found.',
      'low',
      context,
      errorMessage
    )
  }
  
  return createError(
    ErrorCodes.UNKNOWN_ERROR,
    'An unexpected error occurred. Please try again.',
    'medium',
    context,
    errorMessage
  )
}

// Input validation utilities
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email) {
    errors.push('Email is required')
    return { valid: false, errors }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address')
  }
  
  if (email.length > 254) {
    errors.push('Email address is too long')
  }
  
  return { valid: errors.length === 0, errors }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
    return { valid: false, errors }
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  if (password.length > 128) {
    errors.push('Password is too long')
  }
  
  return { valid: errors.length === 0, errors }
}

export function validateTitle(title: string, maxLength: number = 200): ValidationResult {
  const errors: string[] = []
  
  if (!title || !title.trim()) {
    errors.push('Title is required')
    return { valid: false, errors }
  }
  
  if (title.length > maxLength) {
    errors.push(`Title must be less than ${maxLength} characters`)
  }
  
  return { valid: errors.length === 0, errors }
}

export function validateURL(url: string): ValidationResult {
  const errors: string[] = []
  
  if (!url) {
    return { valid: true, errors: [] } // URL is optional
  }
  
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.push('URL must use http or https protocol')
    }
  } catch {
    errors.push('Please enter a valid URL')
  }
  
  return { valid: errors.length === 0, errors }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Sanitize HTML (for rich text)
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Simple sanitization - removes dangerous content
  let sanitized = html
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '')
  sanitized = sanitized.replace(/\s*on\w+='[^']*'/gi, '')
  
  return sanitized
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Error logging
export function logError(error: AppError | Error, context?: string) {
  const errorObj = error instanceof Error 
    ? createError(ErrorCodes.UNKNOWN_ERROR, error.message, 'medium', context)
    : error
  
  // In production, this would send to a logging service
  console.error('[Frame Error]', {
    code: errorObj.code,
    message: errorObj.message,
    context: errorObj.context,
    details: errorObj.details,
    severity: errorObj.severity,
    timestamp: errorObj.timestamp.toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  })
}

// Retry utility for failed operations
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const delay = baseDelay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Offline detection
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

// Connection status listener
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
