"use client"

import React from 'react'
import { FileText, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PDFViewerFallbackProps {
  file: string
  title: string
  page?: number
  className?: string
}

export function PDFViewerFallback({ file, title, page = 1, className = "" }: PDFViewerFallbackProps) {
  const handleOpenInNewTab = () => {
    window.open(file, '_blank')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = file
    link.download = title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#2C2C2C" }}>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" style={{ color: "#B0B0B0" }} />
          <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
            {title}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          Page {page}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <FileText className="h-24 w-24 mb-6" style={{ color: "#444444" }} />
        
        <h3 className="text-lg font-medium mb-2" style={{ color: "#FFFFFF" }}>
          PDF Preview Unavailable
        </h3>
        
        <p className="text-sm text-center mb-6 max-w-md" style={{ color: "#B0B0B0" }}>
          The PDF viewer couldn't load properly. You can still open or download the document using the buttons below.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2"
            style={{ backgroundColor: "#00FF99", color: "#000000" }}
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: "#2C2C2C", color: "#B0B0B0" }}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
} 