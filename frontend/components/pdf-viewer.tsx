"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  const [imageError, setImageError] = useState<boolean>(false)

  useEffect(() => {
    setPageNumber(initialPage)
  }, [initialPage])

  // Get filename from file path
  const getFilename = (filePath: string): string => {
    if (!filePath) return ''
    const parts = filePath.split('/')
    const filename = parts[parts.length - 1]
    // Decode the filename if it's URL encoded
    return decodeURIComponent(filename)
  }

  // Detect number of pages by trying to load images
  const detectNumPages = async (filename: string) => {
    let pageCount = 0
    let currentPage = 1
    
    while (true) {
      try {
        const response = await fetch(`http://localhost:8000/api/files/preview/${encodeURIComponent(filename)}/${currentPage}`, {
          method: 'HEAD'
        })
        
        if (response.ok) {
          pageCount = currentPage
          currentPage++
        } else {
          break
        }
      } catch {
        break
      }
    }
    
    return pageCount
  }

  useEffect(() => {
    if (file && typeof file === 'string') {
      const filename = getFilename(file)
      if (filename) {
        setLoading(true)
        setError(null)
        
        detectNumPages(filename).then(count => {
          if (count > 0) {
            setNumPages(count)
            setLoading(false)
          } else {
            setError('No preview images found')
            setLoading(false)
          }
        }).catch(err => {
          setError('Failed to load preview')
          setLoading(false)
        })
      }
    }
  }, [file])

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      onPageChange?.(newPage)
      setImageError(false)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const rotate = () => setRotation(prev => (prev + 90) % 360)

  const handleImageError = () => {
    setImageError(true)
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

  const filename = typeof file === 'string' ? getFilename(file) : ''
  const imageUrl = filename ? `http://localhost:8000/api/files/preview/${encodeURIComponent(filename)}/${pageNumber}` : ''

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

      {/* Image Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="text-center">
            <p className="text-gray-400">Loading preview...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center max-w-md">
            <p className="text-red-400 mb-2">Error loading preview:</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        {!loading && !error && imageUrl && (
          <div className="flex items-center justify-center">
            {imageError ? (
              <div className="text-center">
                <p className="text-red-400 mb-2">Failed to load page {pageNumber}</p>
                <p className="text-red-300 text-sm">Image not found</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={`PDF page ${pageNumber}`}
                onError={handleImageError}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                className="shadow-lg"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
} 