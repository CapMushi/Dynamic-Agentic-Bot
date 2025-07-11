"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Plus, Database, FileText, BarChart3, User, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Persona, UploadedFile } from "@/lib/types"

interface KnowledgePanelProps {
  personas: Persona[]
  uploadedFiles: UploadedFile[]
  onPersonaToggle: (personaId: string) => void
  onFileUpload: (files: FileList | null) => void
}

export function KnowledgePanel({ personas, uploadedFiles, onPersonaToggle, onFileUpload }: KnowledgePanelProps) {
  const [showAddPersona, setShowAddPersona] = useState(false)
  const [newPersonaName, setNewPersonaName] = useState("")
  const [newPersonaApiKey, setNewPersonaApiKey] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onFileUpload(e.dataTransfer.files)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "csv":
        return <BarChart3 className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPersonaIcon = (name: string) => {
    if (name.includes("Financial")) return <BarChart3 className="h-4 w-4" />
    if (name.includes("Legal")) return <User className="h-4 w-4" />
    return <Bot className="h-4 w-4" />
  }

  return (
    <div className="h-full p-4 space-y-4" style={{ backgroundColor: "#1A1F1C" }}>
      <Card style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Upload className="h-5 w-5" />
            Upload Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-opacity-80 transition-colors cursor-pointer"
            style={{
              borderColor: "#2C2C2C",
              backgroundColor: "#0C0C0C",
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00FF99")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2C2C2C")}
          >
            <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: "#00FF99" }} />
            <p className="text-sm" style={{ color: "#FFFFFF" }}>
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs mt-1" style={{ color: "#B0B0B0" }}>
              PDF, CSV, or Database files
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.csv"
            className="hidden"
            onChange={(e) => onFileUpload(e.target.files)}
          />

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:text-white transition-colors bg-transparent"
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
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:text-white transition-colors bg-transparent"
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
              <BarChart3 className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:text-white transition-colors bg-transparent"
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
              <Database className="h-4 w-4 mr-1" />
              DB
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <CardHeader>
          <CardTitle className="text-sm" style={{ color: "#FFFFFF" }}>
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ backgroundColor: "#2C2C2C" }}
            >
              <div style={{ color: "#00FF99" }}>{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: "#FFFFFF" }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "#B0B0B0" }}>
                  {file.size}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
