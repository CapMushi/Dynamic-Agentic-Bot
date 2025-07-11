// Centralized Type Definitions for Dynamic Agentic Systems
// These types align with the document specifications and can be extended in future phases

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

// Chat message structure with metadata support
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  persona?: string
  citations?: Citation[]
  timestamp: Date
  processingTime?: number // TODO: Add performance metrics in Phase 5
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

// LLM Provider configuration for Phase 3
export interface LLMProvider {
  id: string
  name: string
  apiKey: string
  models: string[]
  rateLimits?: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}

// Metadata for document preview and citation
export interface DocumentMetadata {
  title: string
  section: string
  page: number
  previewUrl: string
  confidence?: number
  chunkId?: string // TODO: Add chunk identification in Phase 4
}

// Suggested queries for conversational flow
export interface SuggestedQuery {
  id: string
  text: string
  category: QueryType
  confidence: number
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
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: Date
} 