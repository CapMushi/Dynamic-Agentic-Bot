// Advanced Error Handling System for Phase 3
// This service provides comprehensive error handling with retry mechanisms

import React from 'react'
import { storageService } from './storage'
import type { ErrorHandlingConfig, ChatMessage } from './types'

export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  API_LIMIT = 'api_limit',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PROCESSING = 'processing',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  type: ErrorType
  message: string
  code?: string | number
  details?: any
  timestamp: Date
  retryable: boolean
  userMessage: string
}

export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  timeoutMs: number
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private config: ErrorHandlingConfig
  private retryAttempts = new Map<string, number>()

  private constructor() {
    this.config = storageService.getErrorConfig()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Update configuration
  updateConfig(config: Partial<ErrorHandlingConfig>) {
    this.config = { ...this.config, ...config }
    storageService.saveErrorConfig(this.config)
  }

  // Handle backend API specific errors
  private handleBackendApiError(error: any, timestamp: Date): ErrorContext {
    const status = error.status || error.response?.status
    const data = error.data || error.response?.data
    const errorMessage = data?.error || error.message

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: errorMessage || 'Invalid request',
          code: status,
          details: error,
          timestamp,
          retryable: false,
          userMessage: errorMessage || 'Invalid request format. Please check your input.'
        }
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication failed',
          code: status,
          details: error,
          timestamp,
          retryable: false,
          userMessage: 'Authentication failed. Please check your API key configuration.'
        }
      case 429:
        return {
          type: ErrorType.API_LIMIT,
          message: 'Rate limit exceeded',
          code: status,
          details: error,
          timestamp,
          retryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.'
        }
      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.PROCESSING,
          message: errorMessage || 'Server error',
          code: status,
          details: error,
          timestamp,
          retryable: true,
          userMessage: errorMessage || 'Server error occurred. Please try again in a moment.'
        }
      default:
        return {
          type: ErrorType.UNKNOWN,
          message: errorMessage || 'Unknown backend error',
          code: status,
          details: error,
          timestamp,
          retryable: false,
          userMessage: errorMessage || 'An unexpected error occurred.'
        }
    }
  }

  // Parse and classify errors
  parseError(error: any): ErrorContext {
    const timestamp = new Date()
    
    // Handle backend API response errors first
    if (error.response || (error.status && typeof error.status === 'number')) {
      return this.handleBackendApiError(error, timestamp)
    }
    
    // Network errors
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network connection failed',
        details: error,
        timestamp,
        retryable: true,
        userMessage: 'Network connection failed. Please check your internet connection and try again.'
      }
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timed out',
        details: error,
        timestamp,
        retryable: true,
        userMessage: 'Request timed out. The server may be experiencing high load. Please try again.'
      }
    }

    // API rate limit errors
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return {
        type: ErrorType.API_LIMIT,
        message: 'API rate limit exceeded',
        code: error.status,
        details: error,
        timestamp,
        retryable: true,
        userMessage: 'API rate limit exceeded. Please wait a moment before trying again.'
      }
    }

    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication failed',
        code: error.status,
        details: error,
        timestamp,
        retryable: false,
        userMessage: 'Authentication failed. Please check your API key configuration.'
      }
    }

    // Validation errors
    if (error.status === 400 || error.message?.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Request validation failed',
        code: error.status,
        details: error,
        timestamp,
        retryable: false,
        userMessage: 'Invalid request format. Please check your input and try again.'
      }
    }

    // Processing errors
    if (error.status >= 500) {
      return {
        type: ErrorType.PROCESSING,
        message: 'Server processing error',
        code: error.status,
        details: error,
        timestamp,
        retryable: true,
        userMessage: 'Server error occurred. Please try again in a moment.'
      }
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Unknown error occurred',
      details: error,
      timestamp,
      retryable: false,
      userMessage: this.config.fallbackResponse
    }
  }

  // Execute function with retry logic
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = {
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay,
      backoffMultiplier: 2,
      timeoutMs: this.config.timeoutMs,
      ...customConfig
    }

    let lastError: ErrorContext | null = null
    const currentAttempt = this.retryAttempts.get(operationId) || 0

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Clear retry count on successful execution
        this.retryAttempts.delete(operationId)
        
        // Execute with timeout
        const result = await this.withTimeout(operation(), config.timeoutMs)
        return result
      } catch (error) {
        lastError = this.parseError(error)
        
        // Log error details
        console.error(`Attempt ${attempt + 1} failed:`, lastError)
        
        // Don't retry if error is not retryable or max retries reached
        if (!lastError.retryable || attempt >= config.maxRetries) {
          break
        }

        // Update retry count
        this.retryAttempts.set(operationId, currentAttempt + attempt + 1)
        
        // Wait before retry with exponential backoff
        const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt)
        await this.delay(delay)
      }
    }

    // All retries failed
    throw lastError
  }

  // Create error message for chat
  createErrorMessage(error: ErrorContext, retryCount: number = 0): ChatMessage {
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: error.userMessage,
      timestamp: new Date(),
      error: error.message,
      retryCount
    }
  }

  // Handle specific error types with custom actions
  async handleError(error: ErrorContext, onRetry?: () => void): Promise<void> {
    switch (error.type) {
      case ErrorType.NETWORK:
        // Could show network status indicator
        break
      
      case ErrorType.API_LIMIT:
        // Could show rate limit warning
        break
      
      case ErrorType.AUTHENTICATION:
        // Could redirect to API key configuration
        break
      
      case ErrorType.TIMEOUT:
        // Could show timeout settings
        break
      
      default:
        // Generic error handling
        break
    }

    // Log to console for debugging
    console.error('Error handled:', error)
  }

  // Utility methods
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ])
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Get retry statistics
  getRetryStats(): { operationId: string, attempts: number }[] {
    return Array.from(this.retryAttempts.entries()).map(([operationId, attempts]) => ({
      operationId,
      attempts
    }))
  }

  // Clear retry statistics
  clearRetryStats(): void {
    this.retryAttempts.clear()
  }

  // Check if operation is currently being retried
  isRetrying(operationId: string): boolean {
    return this.retryAttempts.has(operationId)
  }

  // Get current retry count for operation
  getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: any, operationId: string, onRetry?: () => void) => {
    const errorContext = errorHandler.parseError(error)
    errorHandler.handleError(errorContext, onRetry)
    return errorContext
  }

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    operationId: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> => {
    return errorHandler.executeWithRetry(operation, operationId, customConfig)
  }

  const createErrorMessage = (error: ErrorContext, retryCount: number = 0): ChatMessage => {
    return errorHandler.createErrorMessage(error, retryCount)
  }

  const isRetrying = (operationId: string): boolean => {
    return errorHandler.isRetrying(operationId)
  }

  const getRetryCount = (operationId: string): number => {
    return errorHandler.getRetryCount(operationId)
  }

  return {
    handleError,
    executeWithRetry,
    createErrorMessage,
    isRetrying,
    getRetryCount
  }
}

// Error boundary component helper
export function createErrorBoundary(fallbackComponent: React.ComponentType<{ error: Error }>) {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const errorContext = errorHandler.parseError(error)
      errorHandler.handleError(errorContext)
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(fallbackComponent, { error: this.state.error })
      }

      return this.props.children
    }
  }
} 