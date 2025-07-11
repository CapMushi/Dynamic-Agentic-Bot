"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { KnowledgePanel } from "@/components/knowledge-panel"
import { ChatPanel } from "@/components/chat-panel"
import { MetadataPanel } from "@/components/metadata-panel"
import { EnhancedMetadataPanel } from "@/components/enhanced-metadata-panel"
import { useQueryProcessing } from "@/hooks/use-query-processing"
import { Eye } from "lucide-react"
import type { Persona, ChatMessage, UploadedFile, DocumentMetadata } from "@/lib/types"

// TODO: Remove these interfaces once all components are updated to use centralized types

export function DashboardLayout() {
  // TODO: Move to centralized state management in Phase 2
  const [personas, setPersonas] = useState<Persona[]>([
    { id: "1", name: "Financial Analyst", provider: "OpenAI GPT-4", active: true, color: "bg-blue-500" },
    { id: "2", name: "Legal Advisor", provider: "Claude 3.5", active: false, color: "bg-purple-500" },
    { id: "3", name: "General Assistant", provider: "DeepSeek", active: false, color: "bg-green-500" },
  ])

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant. Upload some documents and select a persona to get started.",
      timestamp: new Date(),
    },
  ])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "Financial_Report_Q3.pdf", type: "pdf", size: "2.4 MB", uploadDate: new Date(), status: "completed" },
    { id: "2", name: "Stock_Prices_2024.csv", type: "csv", size: "856 KB", uploadDate: new Date(), status: "completed" },
  ])

  const [selectedMetadata, setSelectedMetadata] = useState<DocumentMetadata>({
    title: "Financial_Report_Q3.pdf",
    section: "Revenue Analysis",
    page: 15,
    previewUrl: "/placeholder.svg?height=400&width=300",
  })

  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)

  // Use the query processing hook
  const { isProcessing, queryTrace, queryType, estimatedDuration, suggestedQueries, sendQuery } = useQueryProcessing()

  const activePersona = personas.find((p) => p.active)

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Use the query processing hook
    const aiResponse = await sendQuery(content, activePersona?.name || "General Assistant")
    
    if (aiResponse) {
      setMessages((prev) => [...prev, aiResponse])
    }
  }

  const handlePersonaToggle = (personaId: string) => {
    setPersonas((prev) =>
      prev.map((p) => ({
        ...p,
        active: p.id === personaId,
      })),
    )
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".csv") ? "csv" : "database",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date(),
      }
      setUploadedFiles((prev) => [...prev, newFile])
    })
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-screen h-screen overflow-hidden bg-[#0C0C0C]">
        {/* Left Panel - Knowledge & Persona Control */}
        <div
          className="flex-shrink-0" style={{ width: 300, backgroundColor: "#1A1F1C", borderRight: "1px solid #2C2C2C" }}
        >
          <KnowledgePanel
            personas={personas}
            uploadedFiles={uploadedFiles}
            onPersonaToggle={handlePersonaToggle}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Center Panel - Main Chat Interface */}
        <div
          className="flex-1 min-w-0 w-auto transition-all duration-300"
          style={{ backgroundColor: "#0C0C0C" }}
        >
          <ChatPanel
            messages={messages}
            queryTrace={queryTrace}
            activePersona={activePersona}
            isProcessing={isProcessing}
            queryType={queryType}
            estimatedDuration={estimatedDuration}
            suggestedQueries={suggestedQueries}
            onSendMessage={handleSendMessage}
            onMetadataSelect={setSelectedMetadata}
          />
        </div>

        {/* Right Panel - Metadata + Preview */}
        {isRightPanelVisible && (
          <div
            className="w-1/4 min-w-[300px] border-l transition-all duration-300 flex-shrink-0"
            style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}
          >
            <MetadataPanel
              metadata={selectedMetadata}
              onTogglePanel={() => setIsRightPanelVisible(!isRightPanelVisible)}
            />
          </div>
        )}

        {/* Floating Eye Icon when panel is hidden */}
        {!isRightPanelVisible && (
          <div className="fixed top-20 right-4 z-10">
            <button
              onClick={() => setIsRightPanelVisible(true)}
              className="p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: "#00FF99" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00D26A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FF99")}
            >
              <Eye className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
