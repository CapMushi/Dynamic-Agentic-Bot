"use client"

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PDF Viewer Error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-2">Something went wrong</p>
            <p className="text-gray-400 text-sm">Please try refreshing the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 