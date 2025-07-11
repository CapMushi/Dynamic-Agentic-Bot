"use client"

import { useState } from "react"
import { Maximize2, FileText, Calendar, Hash, Info, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MetadataPanelProps {
  metadata: {
    title: string
    section: string
    page: number
    previewUrl: string
  }
  onTogglePanel: () => void
  citations?: Array<{
    title: string
    section: string
    page: number
    screenshot?: string
  }>
  chunks?: {
    current: number
    total: number
  }
  onChunkNavigate?: (chunk: number) => void
}

export function MetadataPanel({ metadata, onTogglePanel, citations = [], chunks, onChunkNavigate }: MetadataPanelProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  // For chunk navigation
  const currentChunk = chunks?.current || 1
  const totalChunks = chunks?.total || 1

  const handlePrevChunk = () => {
    if (onChunkNavigate && currentChunk > 1) onChunkNavigate(currentChunk - 1)
  }
  const handleNextChunk = () => {
    if (onChunkNavigate && currentChunk < totalChunks) onChunkNavigate(currentChunk + 1)
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#1A1F1C" }}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <h2 className="text-xl font-bold flex-1 text-center" style={{ color: "#E0FFE5" }}>
              Metadata & Preview
            </h2>
            <div className="flex-1 flex justify-end">
              {/* <button
                onClick={onTogglePanel}
                className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: "#2C2C2C" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#00FF99"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2C2C2C"
                }}
              >
                <Eye className="h-5 w-5" style={{ color: "#B0B0B0" }} />
              </button> */}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
          {/* Metadata Section */}
          <Card className="shadow-lg flex-shrink-0 mb-4" style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium" style={{ color: "#B0B0B0" }}>
                    Source Title
                  </label>
                  <p className="font-medium" style={{ color: "#FFFFFF" }}>
                    {metadata.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: "#B0B0B0" }}>
                    Section
                  </label>
                  <p style={{ color: "#FFFFFF" }}>{metadata.section}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: "#B0B0B0" }}>
                      Page
                    </label>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4" style={{ color: "#B0B0B0" }} />
                      <span className="font-medium" style={{ color: "#FFFFFF" }}>
                        {metadata.page}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium" style={{ color: "#B0B0B0" }}>
                      Type
                    </label>
                    <Badge variant="secondary" className="ml-1 text-white" style={{ backgroundColor: "#00D26A" }}>
                      PDF
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Chunk Navigation */}
              {totalChunks > 1 && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevChunk}
                    disabled={currentChunk === 1}
                    style={{ backgroundColor: "#2C2C2C", color: "#B0B0B0", borderColor: "#2C2C2C" }}
                  >
                    Prev
                  </Button>
                  <span className="text-xs" style={{ color: "#B0B0B0" }}>
                    Chunk {currentChunk} of {totalChunks}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextChunk}
                    disabled={currentChunk === totalChunks}
                    style={{ backgroundColor: "#2C2C2C", color: "#B0B0B0", borderColor: "#2C2C2C" }}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Citations Section */}
              {citations.length > 0 && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: "#2C2C2C" }}>
                  <p className="text-sm font-medium mb-2" style={{ color: "#B0B0B0" }}>
                    Citations:
                  </p>
                  <div className="space-y-1">
                    {citations.map((citation, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded text-sm border"
                        style={{ backgroundColor: "#2C2C2C", borderColor: "#2C2C2C" }}
                      >
                        <span className="font-medium" style={{ color: "#FFFFFF" }}>
                          {citation.title}
                        </span>
                        <span style={{ color: "#B0B0B0" }}>
                          - {citation.section}, Page {citation.page}
                        </span>
                        {citation.screenshot && (
                          <img
                            src={citation.screenshot}
                            alt="screenshot"
                            className="h-6 w-6 rounded border ml-2"
                            style={{ borderColor: "#00FF99" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information Button */}
              <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:text-white transition-colors bg-transparent"
                    style={{
                      backgroundColor: "#2C2C2C",
                      borderColor: "#2C2C2C",
                      color: "#B0B0B0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#00FF99"
                      e.currentTarget.style.borderColor = "#00FF99"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2C2C2C"
                      e.currentTarget.style.borderColor = "#2C2C2C"
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Additional Information
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
                  <DialogHeader>
                    <DialogTitle style={{ color: "#FFFFFF" }}>Additional Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" style={{ color: "#B0B0B0" }} />
                      <span style={{ color: "#B0B0B0" }}>Last accessed:</span>
                      <span style={{ color: "#FFFFFF" }}>Today, 2:30 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" style={{ color: "#B0B0B0" }} />
                      <span style={{ color: "#B0B0B0" }}>File size:</span>
                      <span style={{ color: "#FFFFFF" }}>2.4 MB</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4" style={{ color: "#B0B0B0" }} />
                      <span style={{ color: "#B0B0B0" }}>Total pages:</span>
                      <span style={{ color: "#FFFFFF" }}>45</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card
            className="shadow-lg flex-1 flex flex-col min-h-0"
            style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}
          >
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center justify-between" style={{ color: "#FFFFFF" }}>
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Preview
                </span>
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:text-white"
                          style={{ color: "#B0B0B0" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2C2C2C"
                            e.currentTarget.style.color = "#00FF99"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent"
                            e.currentTarget.style.color = "#B0B0B0"
                          }}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Expand preview</p>
                      </TooltipContent>
                    </Tooltip>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-4xl max-h-[90vh]"
                    style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}
                  >
                    <DialogHeader>
                      <DialogTitle style={{ color: "#FFFFFF" }}>
                        {metadata.title} - Page {metadata.page}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <img
                        src={metadata.previewUrl || "/placeholder.svg"}
                        alt={`Preview of ${metadata.title} page ${metadata.page}`}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
              <div
                className="relative group cursor-pointer flex-1 flex items-center justify-center min-h-0 overflow-hidden"
                onClick={() => setIsPreviewOpen(true)}
              >
                <img
                  src={metadata.previewUrl || "/placeholder.svg"}
                  alt={`Preview of ${metadata.title} page ${metadata.page}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <Maximize2
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#00FF99" }}
                  />
                </div>
              </div>
              <p className="text-sm mt-2 text-center flex-shrink-0" style={{ color: "#B0B0B0" }}>
                Click to expand fullscreen
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
