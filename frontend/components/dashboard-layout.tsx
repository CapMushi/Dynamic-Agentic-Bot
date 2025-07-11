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
import { Eye, Settings, History, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Persona, ChatMessage, UploadedFile, DocumentMetadata, QueryHistory, LLMProvider } from "@/lib/types"

export function DashboardLayout() {
  // Phase 3: Enhanced state management with persistence
  const [personas, setPersonas] = useState<Persona[]>([
    { id: "1", name: "Financial Analyst", provider: "OpenAI", active: true, color: "#6B73FF" },
    { id: "2", name: "Legal Advisor", provider: "Claude", active: false, color: "#9B59B6" },
    { id: "3", name: "General Assistant", provider: "DeepSeek", active: false, color: "#00FF99" },
  ])

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant with enhanced Phase 3 capabilities including real-time tracing, query history, and LLM provider management. Upload some documents and select a persona to get started.",
      timestamp: new Date(),
    },
  ])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "Financial_Report_Q3.pdf", type: "pdf", size: "2.4", uploadDate: new Date(), status: "completed" },
    { id: "2", name: "Stock_Prices_2024.csv", type: "csv", size: "0.856", uploadDate: new Date(), status: "completed" },
  ])

  const [selectedMetadata, setSelectedMetadata] = useState<DocumentMetadata>({
    title: "Financial_Report_Q3.pdf",
    section: "Revenue Analysis",
    page: 15,
    previewUrl: "/placeholder.svg?height=400&width=300",
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
        size: `${(file.size / 1024 / 1024).toFixed(1)}`,
        uploadDate: new Date(),
        status: "processing"
      }
      setUploadedFiles((prev) => [...prev, newFile])
    })
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

        {/* Right Panel - Enhanced Metadata + Performance */}
        {isRightPanelVisible && (
          <div
            className="w-1/4 min-w-[320px] border-l transition-all duration-300 flex-shrink-0"
            style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}
          >
            <div className="h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>
                  Metadata & Performance
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const metrics = getMetrics()
                      console.log('Current performance metrics:', metrics)
                    }}
                    style={{ color: "#B0B0B0" }}
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
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
              
              <div className="space-y-4">
                <MetadataPanel
                  metadata={selectedMetadata}
                  onTogglePanel={() => setIsRightPanelVisible(!isRightPanelVisible)}
                />
                
                {/* Phase 3: Performance Metrics */}
                <div className="border rounded-lg p-3" style={{ backgroundColor: "#2C2C2C", borderColor: "#444444" }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                    System Performance
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: "#B0B0B0" }}>Queries Processed:</span>
                      <span style={{ color: "#FFFFFF" }}>{queryHistory.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#B0B0B0" }}>LLM Providers:</span>
                      <span style={{ color: "#FFFFFF" }}>{llmProviders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#B0B0B0" }}>Active Retries:</span>
                      <span style={{ color: "#FFFFFF" }}>{isRetrying('global') ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#B0B0B0" }}>Real-time Tracing:</span>
                      <span style={{ color: "#00FF99" }}>Active</span>
                    </div>
                  </div>
                </div>
                
                {/* Phase 3: WebSocket Status */}
                <div className="border rounded-lg p-3" style={{ backgroundColor: "#2C2C2C", borderColor: "#444444" }}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
                    WebSocket Status
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00FF99" }} />
                    <span className="text-xs" style={{ color: "#B0B0B0" }}>Connected (Simulation)</span>
                  </div>
                </div>
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
            
            <Button
              onClick={() => {
                const metrics = getMetrics()
                console.log('Performance metrics:', metrics)
              }}
              size="sm"
              className="rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: "#6B73FF" }}
            >
              <Zap className="h-4 w-4 text-white" />
            </Button>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
