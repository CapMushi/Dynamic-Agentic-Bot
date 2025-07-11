"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  EyeOff, 
  FileText, 
  Database, 
  Layers, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  ExternalLink
} from 'lucide-react'
import type { DocumentMetadata, UploadedFile } from '@/lib/types'

interface EnhancedMetadataPanelProps {
  metadata: DocumentMetadata
  uploadedFiles: UploadedFile[]
  onTogglePanel: () => void
  onDownload?: (fileId: string) => void
  onViewDocument?: (fileId: string) => void
}

export function EnhancedMetadataPanel({ 
  metadata, 
  uploadedFiles,
  onTogglePanel,
  onDownload,
  onViewDocument
}: EnhancedMetadataPanelProps) {
  const currentFile = uploadedFiles.find(f => f.name === metadata.title)

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1A1F1C' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b" style={{ borderColor: '#2C2C2C' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#E0FFE5' }}>
            Document Metadata
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePanel}
            className="hover:bg-gray-800"
          >
            <EyeOff className="h-4 w-4" style={{ color: '#B0B0B0' }} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Document Preview */}
        <Card style={{ backgroundColor: '#2C2C2C', borderColor: '#2C2C2C' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <FileText className="h-4 w-4" />
              Document Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center">
                <img
                  src={metadata.previewUrl}
                  alt={`Preview of ${metadata.title}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-white">{metadata.title}</p>
                <p className="text-xs text-gray-400">
                  {metadata.section} • Page {metadata.page}
                </p>
                
                {metadata.confidence && (
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xs text-gray-400">Relevance:</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        metadata.confidence > 0.8 ? 'bg-green-500' :
                        metadata.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    >
                      {Math.round(metadata.confidence * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Information */}
        {currentFile && (
          <Card style={{ backgroundColor: '#2C2C2C', borderColor: '#2C2C2C' }}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <Database className="h-4 w-4" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">File Type</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {currentFile.type.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400">Size</p>
                  <p className="text-white font-medium">{currentFile.size}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {currentFile.status === 'completed' && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {currentFile.status === 'processing' && (
                      <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />
                    )}
                    {currentFile.status === 'error' && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-white capitalize">{currentFile.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Uploaded</p>
                  <p className="text-white font-medium text-xs">
                    {currentFile.uploadDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Processing Information */}
              {currentFile.chunks && (
                <div className="pt-3 border-t border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Processing Details</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Chunks Created:</span>
                      <span className="text-white font-medium">{currentFile.chunks}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Indexed:</span>
                      <span className="text-white font-medium">
                        {currentFile.indexed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    {currentFile.processingTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Processing Time:</span>
                        <span className="text-white font-medium">
                          {Math.round(currentFile.processingTime)}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extracted Sections */}
              {currentFile.extractedSections && (
                <div className="pt-3 border-t border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Extracted Sections</span>
                  </div>
                  
                  <div className="space-y-1">
                    {currentFile.extractedSections.map((section, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="text-xs mr-1 mb-1"
                        style={{ borderColor: '#00FF99', color: '#00FF99' }}
                      >
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#2C2C2C', 
                      borderColor: '#2C2C2C',
                      color: '#B0B0B0'
                    }}
                    onClick={() => onViewDocument?.(currentFile.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#00FF99'
                      e.currentTarget.style.borderColor = '#00FF99'
                      e.currentTarget.style.color = '#000000'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2C2C2C'
                      e.currentTarget.style.borderColor = '#2C2C2C'
                      e.currentTarget.style.color = '#B0B0B0'
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    style={{ 
                      backgroundColor: '#2C2C2C', 
                      borderColor: '#2C2C2C',
                      color: '#B0B0B0'
                    }}
                    onClick={() => onDownload?.(currentFile.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#00FF99'
                      e.currentTarget.style.borderColor = '#00FF99'
                      e.currentTarget.style.color = '#000000'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2C2C2C'
                      e.currentTarget.style.borderColor = '#2C2C2C'
                      e.currentTarget.style.color = '#B0B0B0'
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chunk Information */}
        {metadata.chunkId && (
          <Card style={{ backgroundColor: '#2C2C2C', borderColor: '#2C2C2C' }}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <Layers className="h-4 w-4" />
                Chunk Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-400">Chunk ID</p>
                <p className="text-white font-mono text-xs">{metadata.chunkId}</p>
              </div>
              
              <div className="text-sm">
                <p className="text-gray-400">Vector Match</p>
                <p className="text-white">
                  {metadata.confidence ? `${Math.round(metadata.confidence * 100)}% similarity` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Uploaded Files */}
        <Card style={{ backgroundColor: '#2C2C2C', borderColor: '#2C2C2C' }}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Database className="h-4 w-4" />
              Knowledge Base
              <Badge variant="secondary" className="ml-2 text-xs">
                {uploadedFiles.length} files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-2 rounded-lg border transition-colors ${
                    file.name === metadata.title 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-white truncate flex-1">
                      {file.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                  
                  {file.chunks && (
                    <div className="mt-1 text-xs text-gray-400">
                      {file.chunks} chunks • {file.indexed ? 'Indexed' : 'Not indexed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 