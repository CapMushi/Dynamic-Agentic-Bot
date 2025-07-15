"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { KnowledgePanel } from "@/components/knowledge-panel"
import { ChatPanel } from "@/components/chat-panel"
import { MetadataPanel } from "@/components/metadata-panel"
import { EnhancedMetadataPanel } from "@/components/enhanced-metadata-panel"
import { PersonaManagementPanel } from "@/components/persona-management-panel"
import { QueryHistoryPanel } from "@/components/query-history-panel"
import { useQueryProcessing } from "@/hooks/use-query-processing"
import { useWebSocketSimulation } from "@/lib/websocket-simulation"
import { storageService } from "@/lib/storage"
import { useErrorHandler } from "@/lib/error-handler"
import { usePerformanceOptimization } from "@/lib/performance"
import { api } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Eye, Settings, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Persona, ChatMessage, UploadedFile, DocumentMetadata, QueryHistory, LLMProvider } from "@/lib/types"

export function DashboardLayout() {
  // Enhanced state management with backend sync
  const [personas, setPersonas] = useState<Persona[]>([
    { id: "1", name: "Financial Analyst", provider: "OpenAI", active: true, color: "#6B73FF" },
    { id: "2", name: "Legal Advisor", provider: "Claude", active: false, color: "#9B59B6" },
    { id: "3", name: "General Assistant", provider: "DeepSeek", active: false, color: "#00FF99" },
  ])

  // Load personas from backend on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        logger.info('Loading personas from backend', 'DASHBOARD')
        const response = await api.getPersonas()
        if (response.success && response.data.length > 0) {
          setPersonas(response.data)
          logger.info(`Loaded ${response.data.length} personas from backend`, 'DASHBOARD')
        }
      } catch (error) {
        logger.error('Failed to load personas from backend', error, 'DASHBOARD')
        // Keep default personas if backend fails
      }
    }
    loadPersonas()
  }, [])

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant connected to the backend with real-time LangGraph processing, document upload, and multi-persona support. Upload documents and select a persona to get started.",
      timestamp: new Date(),
    },
  ])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  // Load uploaded files from backend on component mount
  useEffect(() => {
    const loadUploadedFiles = async () => {
      try {
        // Note: This would need a backend endpoint to list uploaded files
        // For now, we'll start with empty array and files will be added via upload
        console.log('Ready to load files from backend when endpoint is available')
      } catch (error) {
        console.error('Failed to load uploaded files:', error)
      }
    }
    loadUploadedFiles()
  }, [])

  const [selectedMetadata, setSelectedMetadata] = useState<DocumentMetadata>({
    title: "No document selected",
    section: "Click on a citation or upload a document to see preview",
    page: 0,
    previewUrl: "/placeholder.svg?height=400&width=300",
    content: undefined
  })

  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true)
  const [leftPanelTab, setLeftPanelTab] = useState("sources")
  
  // Phase 3: New state for advanced features
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([])

  // Phase 3: Enhanced hooks
  const { isProcessing, queryTrace, queryType, estimatedDuration, suggestedQueries, sendQuery } = useQueryProcessing()
  const { startQueryTracing, on: onWebSocketEvent, off: offWebSocketEvent } = useWebSocketSimulation()
  const { executeWithRetry, handleError, isRetrying } = useErrorHandler()
  const { optimizeQuery, recordMetric, getMetrics } = usePerformanceOptimization()

  // Phase 3: Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = () => {
      const savedHistory = storageService.getQueryHistory()
      const savedProviders = storageService.getLLMProviders()
      
      setQueryHistory(savedHistory)
      setLLMProviders(savedProviders)
    }

    loadPersistedData()

    // Set up WebSocket event listeners
    const handleQueryProgress = (data: any) => {
      // Real-time query tracing updates would be handled here
      console.log('Query progress update:', data)
    }

    onWebSocketEvent('node_progress', handleQueryProgress)
    onWebSocketEvent('query_complete', handleQueryProgress)

    return () => {
      offWebSocketEvent('node_progress', handleQueryProgress)
      offWebSocketEvent('query_complete', handleQueryProgress)
    }
  }, [])

  const activePersona = personas.find((p) => p.active)

  const handleSendMessage = async (content: string) => {
    const startTime = performance.now()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      // Phase 3: Optimize query and check cache
      const optimization = optimizeQuery(content, queryHistory)
      
      // Phase 3: Start real-time WebSocket tracing
      const persona = activePersona?.name || "General Assistant"
      if (queryType) {
        await startQueryTracing(content, persona, queryType)
      }

      // Phase 3: Execute with retry logic and error handling
      const aiResponse = await executeWithRetry(
        () => sendQuery(optimization.optimizedQuery, persona),
        `query-${Date.now()}`,
        { maxRetries: 3, retryDelay: 1000 }
      )
      
      if (aiResponse) {
        const endTime = performance.now()
        const processingTime = endTime - startTime
        
        // Phase 3: Record performance metrics
        recordMetric('responseTime', processingTime)
        recordMetric('queryProcessingTime', processingTime)

        // Phase 3: Save to query history
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: content,
          response: aiResponse.content,
          persona,
          timestamp: new Date(),
          processingTime,
          citations: aiResponse.citations,
          queryType: queryType || undefined,
          favorite: false
        }
        
        setQueryHistory(prev => {
          const newHistory = [...prev, historyEntry]
          storageService.saveQueryHistory(newHistory)
          return newHistory
        })

        setMessages((prev) => [...prev, aiResponse])
      }
    } catch (error) {
      // Phase 3: Enhanced error handling
      const errorContext = handleError(error, `query-${Date.now()}`)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: errorContext.userMessage,
        timestamp: new Date(),
        error: errorContext.message,
        retryCount: errorContext.retryable ? 1 : 0
      }
      
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handlePersonaToggle = async (personaId: string) => {
    const selectedPersona = personas.find(p => p.id === personaId)
    
    // Update local state immediately for responsive UI
    setPersonas((prev) =>
      prev.map((p) => ({
        ...p,
        active: p.id === personaId,
      })),
    )

    try {
      // Sync with backend
      if (selectedPersona) {
        logger.personaSwitch(personaId, selectedPersona.name)
        await api.updatePersona(selectedPersona.name, {
          id: selectedPersona.id,
          name: selectedPersona.name,
          provider: selectedPersona.provider,
          active: true,
          color: selectedPersona.color,
          apiKey: selectedPersona.apiKey,
          model: selectedPersona.model
        })
      }
    } catch (error) {
      logger.error('Failed to update persona on backend', error, 'DASHBOARD')
      // Could implement rollback here if needed
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    for (const file of Array.from(files)) {
      // Create initial file entry with processing status
      const tempFile: UploadedFile = {
        id: `temp-${Date.now()}`,
        name: file.name,
        type: file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".csv") ? "csv" : "database",
        size: `${(file.size / 1024 / 1024).toFixed(1)}`,
        uploadDate: new Date(),
        status: "processing"
      }
      
      setUploadedFiles((prev) => [...prev, tempFile])

      try {
        // Upload file to backend
        const response = await api.uploadFile(file)
        
        if (response.success) {
          // Update file entry with backend response
          const uploadedFile: UploadedFile = {
            id: response.data.id,
            name: response.data.name,
            type: response.data.type,
            size: tempFile.size,
            uploadDate: tempFile.uploadDate,
            status: response.data.status,
            chunks: response.data.chunks,
            indexed: response.data.indexed,
            extractedSections: response.data.extractedSections
          }
          
          setUploadedFiles((prev) => 
            prev.map(f => f.id === tempFile.id ? uploadedFile : f)
          )
          
          // Update selectedMetadata to show the uploaded document
          const pdfUrl = uploadedFile.name.endsWith('.pdf') 
            ? `http://localhost:8000/api/files/pdf/${uploadedFile.name}`
            : undefined
          
          setSelectedMetadata({
            title: uploadedFile.name,
            section: uploadedFile.extractedSections?.[0] || "Document uploaded",
            page: 1,
            previewUrl: "/placeholder.svg?height=400&width=300",
            pdfUrl: pdfUrl
          })
        } else {
          // Handle upload error
          setUploadedFiles((prev) => 
            prev.map(f => f.id === tempFile.id ? { ...f, status: "error" } : f)
          )
          logger.error('File upload failed', response.error, 'UPLOAD')
        }
      } catch (error) {
        // Handle network error
        setUploadedFiles((prev) => 
          prev.map(f => f.id === tempFile.id ? { ...f, status: "error" } : f)
        )
        logger.error('File upload error', error, 'UPLOAD')
      }
    }
  }

  // Phase 3: LLM Provider Management
  const handleProviderAdd = (provider: Omit<LLMProvider, 'id'>) => {
    const newProvider: LLMProvider = {
      ...provider,
      id: Date.now().toString()
    }
    setLLMProviders(prev => {
      const updated = [...prev, newProvider]
      storageService.saveLLMProviders(updated)
      return updated
    })
  }

  const handleProviderUpdate = (id: string, updates: Partial<LLMProvider>) => {
    setLLMProviders(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      storageService.saveLLMProviders(updated)
      return updated
    })
  }

  const handleProviderDelete = (id: string) => {
    setLLMProviders(prev => {
      const updated = prev.filter(p => p.id !== id)
      storageService.saveLLMProviders(updated)
      return updated
    })
  }



  // Phase 3: Query History Management
  const handleQuerySelect = (query: string) => {
    // Auto-fill the query in the chat input
    handleSendMessage(query)
  }

  const handleToggleFavorite = (id: string) => {
    setQueryHistory(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, favorite: !h.favorite } : h)
      storageService.saveQueryHistory(updated)
      return updated
    })
  }

  const handleDeleteQuery = (id: string) => {
    setQueryHistory(prev => {
      const updated = prev.filter(h => h.id !== id)
      storageService.saveQueryHistory(updated)
      return updated
    })
  }

  const handleClearHistory = () => {
    setQueryHistory([])
    storageService.clearQueryHistory()
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-screen h-screen overflow-hidden bg-[#0C0C0C]">
        {/* Left Panel - Enhanced with Phase 3 Features */}
        <div
          className="flex-shrink-0" style={{ width: 320, backgroundColor: "#1A1F1C", borderRight: "1px solid #2C2C2C" }}
        >
          <div className="h-full p-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: "#E0FFE5" }}>
                Dynamic Agentic Systems
              </h2>
              
            </div>
            
            <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full">
              <TabsList
                className="grid w-full grid-cols-3"
                style={{ backgroundColor: "#2C2C2C", border: "1px solid #2C2C2C" }}
              >
                <TabsTrigger
                  value="sources"
                  className="data-[state=active]:text-white text-xs"
                  style={{ color: "#B0B0B0" }}
                >
                  Sources
                </TabsTrigger>
                <TabsTrigger
                  value="providers"
                  className="data-[state=active]:text-white text-xs"
                  style={{ color: "#B0B0B0" }}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  LLM
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:text-white text-xs"
                  style={{ color: "#B0B0B0" }}
                >
                  <History className="h-3 w-3 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="mt-4 h-full">
                <KnowledgePanel
                  personas={personas}
                  uploadedFiles={uploadedFiles}
                  onPersonaToggle={handlePersonaToggle}
                  onFileUpload={handleFileUpload}
                />
              </TabsContent>

              <TabsContent value="providers" className="mt-4 h-full">
                <PersonaManagementPanel
                  personas={personas}
                  llmProviders={llmProviders}
                  onPersonaToggle={handlePersonaToggle}
                  onProviderAdd={handleProviderAdd}
                  onProviderUpdate={handleProviderUpdate}
                  onProviderDelete={handleProviderDelete}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-4 h-full">
                <QueryHistoryPanel
                  history={queryHistory}
                  onQuerySelect={handleQuerySelect}
                  onToggleFavorite={handleToggleFavorite}
                  onDeleteQuery={handleDeleteQuery}
                  onClearHistory={handleClearHistory}
                />
              </TabsContent>
            </Tabs>
          </div>
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
            queryType={queryType || undefined}
            estimatedDuration={estimatedDuration || undefined}
            suggestedQueries={suggestedQueries}
            onSendMessage={handleSendMessage}
            onMetadataSelect={setSelectedMetadata}
          />
        </div>

        {/* Right Panel - Document Preview & Metadata */}
        {isRightPanelVisible && (
          <div
            className="w-1/4 min-w-[320px] border-l transition-all duration-300 flex-shrink-0 h-full"
            style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}
          >
            <div className="h-full p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>
                  Document Preview
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsRightPanelVisible(false)}
                    style={{ color: "#B0B0B0" }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="h-full flex flex-col">
                <MetadataPanel
                  metadata={selectedMetadata}
                  onTogglePanel={() => setIsRightPanelVisible(!isRightPanelVisible)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Control Panel when right panel is hidden */}
        {!isRightPanelVisible && (
          <div className="fixed top-20 right-4 z-10 flex flex-col gap-2">
            <Button
              onClick={() => setIsRightPanelVisible(true)}
              size="sm"
              className="rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: "#00FF99" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00D26A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FF99")}
            >
              <Eye className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
