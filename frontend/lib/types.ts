// Centralized Type Definitions for Dynamic Agentic Systems
// These types align with the backend API schemas and document specifications

// Note: Backend returns datetime strings, frontend converts to Date objects
// API responses are handled by the API layer which performs this conversion

// Core AI Personas as defined in the project document
export interface Persona {
  id: string
  name: 'Financial Analyst' | 'Legal Advisor' | 'General Assistant'
  provider: 'OpenAI' | 'Claude' | 'DeepSeek' | string
  active: boolean
  color: string
  apiKey?: string // TODO: Implement secure API key management in Phase 4
  model?: string // TODO: Add model selection in Phase 3
}

// Phase 3: LLM Provider Management
export interface LLMProvider {
  id: string
  name: string
  apiKey: string
  models: string[]
  status: 'connected' | 'disconnected' | 'error'
  rateLimits?: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
  isDefault?: boolean
}

// Chat message structure with metadata support
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  persona?: string
  citations?: Citation[]
  timestamp: Date
  processingTime?: number // TODO: Add performance metrics in Phase 5
  retryCount?: number // Phase 3: Error handling
  error?: string // Phase 3: Error handling
}

// Citation structure for document references
export interface Citation {
  title: string
  page: number
  section: string
  screenshot?: string // TODO: Implement actual PDF screenshot extraction in Phase 4
  confidence?: number // TODO: Add confidence scoring in Phase 4
}

// File upload and knowledge base types
export interface UploadedFile {
  id: string
  name: string
  type: 'pdf' | 'csv' | 'database'
  size: string
  uploadDate: Date
  status: 'processing' | 'completed' | 'error'
  chunks?: number // TODO: Display chunking information in Phase 2
  indexed?: boolean // TODO: Show indexing status in Phase 2
  processingTime?: number // Phase 3: Processing time tracking
  extractedSections?: string[] // Phase 3: Extracted sections from documents
}

// Query processing trace for the 8-node LangGraph system
export interface QueryTrace {
  id: string
  step: 'Router Node' | 'Document Node' | 'Database Node' | 'Math Node' | 'Persona Selector' | 'Suggestion Node' | 'Answer Formatter'
  status: 'processing' | 'completed' | 'error'
  timestamp: Date
  duration?: number // TODO: Add timing metrics in Phase 3
  details?: string // TODO: Add detailed step information in Phase 3
}

// Phase 3: Real-time WebSocket events
export interface WebSocketEvent {
  id: string
  type: 'query_start' | 'node_progress' | 'query_complete' | 'error'
  data: any
  timestamp: Date
}

// Query types as defined in the project document
export type QueryType = 'mathematical' | 'factual' | 'conversational'

// Database connection types for Phase 4
export interface DatabaseConnection {
  id: string
  name: string
  type: 'sql' | 'nosql' | 'csv'
  connectionString?: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
}

// Metadata for document preview and citation
export interface DocumentMetadata {
  title: string
  section: string
  page: number
  previewUrl: string
  confidence?: number
  chunkId?: string // TODO: Add chunk identification in Phase 4
  content?: string // For text-based preview
  pdfUrl?: string // For PDF.js viewer
}

// Suggested queries for conversational flow
export interface SuggestedQuery {
  id: string
  text: string
  category: QueryType
  confidence: number
}

// Phase 3: Query History with persistence
export interface QueryHistory {
  id: string
  query: string
  response: string
  persona: string
  timestamp: Date
  processingTime?: number
  citations?: Citation[]
  queryType?: QueryType
  favorite?: boolean
}

// Phase 3: Error handling configuration
export interface ErrorHandlingConfig {
  maxRetries: number
  retryDelay: number
  timeoutMs: number
  fallbackResponse: string
}

// Phase 3: Performance optimization settings
export interface PerformanceConfig {
  maxDocuments: number
  chunkSize: number
  indexingBatchSize: number
  queryTimeout: number
}

// Application state management types
export interface AppState {
  personas: Persona[]
  messages: ChatMessage[]
  uploadedFiles: UploadedFile[]
  queryTrace: QueryTrace[]
  selectedMetadata: DocumentMetadata | null
  isRightPanelVisible: boolean
  isProcessing: boolean
  queryHistory: QueryHistory[] // Phase 3
  llmProviders: LLMProvider[] // Phase 3
  errorConfig: ErrorHandlingConfig // Phase 3
  performanceConfig: PerformanceConfig // Phase 3
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: Date
} 