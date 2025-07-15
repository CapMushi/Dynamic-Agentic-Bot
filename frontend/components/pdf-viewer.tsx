"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dynamically import PDF.js components to avoid SSR issues
const Document = dynamic(
  () => import('react-pdf').then((mod) => mod.Document),
  { ssr: false }
)

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  { ssr: false }
)

// Set up PDF.js worker in useEffect to avoid SSR issues
const usePDFJS = () => {
  useEffect(() => {
    // Import PDF.js configuration
    import('@/lib/pdf-config').catch((error) => {
      console.error('Failed to load PDF.js configuration:', error)
    })
  }, [])
}

interface PDFViewerProps {
  file: string | File | null
  initialPage?: number
  onPageChange?: (page: number) => void
  className?: string
}

export function PDFViewer({ file, initialPage = 1, onPageChange, className = "" }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(initialPage)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState<boolean>(false)

  // Initialize PDF.js
  usePDFJS()

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    setLoading(false)
    setError(error.message)
  }

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      onPageChange?.(newPage)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)

  // Show loading state during SSR or when PDF.js is not ready
  if (!isClient) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <FileText className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-gray-400">Loading PDF viewer...</p>
        </div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <FileText className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-gray-400">No PDF file selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: "#2C2C2C" }}>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changePage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            style={{ color: "#B0B0B0" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Badge variant="outline" className="text-xs">
            {pageNumber} / {numPages}
          </Badge>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changePage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            style={{ color: "#B0B0B0" }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            style={{ color: "#B0B0B0" }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Badge variant="outline" className="text-xs">
            {Math.round(scale * 100)}%
          </Badge>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            style={{ color: "#B0B0B0" }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={rotate}
            style={{ color: "#B0B0B0" }}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="text-center">
            <p className="text-gray-400">Loading PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <p className="text-red-400">Error loading PDF: {error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="text-gray-400">Loading document...</div>}
            error={<div className="text-red-400">Failed to load PDF</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              loading={<div className="text-gray-400">Loading page...</div>}
              error={<div className="text-red-400">Failed to load page</div>}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>
    </div>
  )
} 