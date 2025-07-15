// Enhanced API Service Layer for Phase 2 - Dynamic Agentic Systems
// This mock API service can be easily replaced with real backend endpoints
// TODO: Replace with actual backend API calls when Phase 4 backend integration begins

import { mockResponses, suggestedQueries, simulateQueryProcessing, mockFileProcessing } from './mock-data'
import type { QueryType, SuggestedQuery } from './types'

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: Date
}

export interface QueryRequest {
  message: string
  persona: string
  files?: string[]
}

export interface QueryResponse {
  response: string
  queryType: QueryType
  citations?: Array<{
    title: string
    page: number
    section: string
    screenshot?: string
  }>
  suggestedQueries?: SuggestedQuery[]
  processingTrace?: Array<{
    step: string
    status: 'processing' | 'completed' | 'error'
    timestamp: Date
    duration?: number
  }>
  processingTime: number
}

export interface FileUploadResponse {
  id: string
  name: string
  type: 'pdf' | 'csv' | 'database'
  status: 'processing' | 'completed' | 'error'
  chunks?: number
  indexed?: boolean
  processingTime?: number
  extractedSections?: string[]
}

// Enhanced Mock API functions with realistic data - Replace with actual API calls in Phase 4
export const mockApi = {
  // TODO: Replace with actual query endpoint
  async sendQuery(request: QueryRequest): Promise<ApiResponse<QueryResponse>> {
    const startTime = Date.now()
    
    // Simulate query processing analysis
    const { queryType, estimatedDuration, nodeSequence } = simulateQueryProcessing(request.message, request.persona)
    
    // Simulate API delay based on query complexity
    await new Promise(resolve => setTimeout(resolve, Math.min(estimatedDuration, 3000)))
    
    // Find appropriate mock response
    const personaResponses = mockResponses[request.persona as keyof typeof mockResponses]
    let mockResponse: any
    
    if (personaResponses) {
      const responseCategory = personaResponses[queryType as keyof typeof personaResponses]
      if (responseCategory && Array.isArray(responseCategory)) {
        // Find best matching response or use first one
        mockResponse = responseCategory.find(r => 
          request.message.toLowerCase().includes(r.query.toLowerCase())
        ) || responseCategory[0]
      }
    }
    
    // Fallback response
    if (!mockResponse) {
      mockResponse = {
        response: `I understand you're asking about "${request.message}" using the ${request.persona} persona. This is a mock response that would be replaced with actual LangGraph processing.`,
        citations: [],
        processingTrace: [
          { step: 'Router Node', duration: 100 },
          { step: 'Answer Formatter', duration: 200 }
        ]
      }
    }
    
    const processingTime = Date.now() - startTime
    
    return {
      success: true,
      timestamp: new Date(),
      data: {
        response: mockResponse.response,
        queryType,
        citations: mockResponse.citations || [],
        suggestedQueries: suggestedQueries[request.persona] || [],
        processingTrace: mockResponse.processingTrace?.map((trace: any, index: number) => ({
          step: trace.step,
          status: 'completed' as const,
          timestamp: new Date(Date.now() - (mockResponse.processingTrace.length - index) * 100),
          duration: trace.duration
        })) || [],
        processingTime
      }
    }
  },

  // TODO: Replace with actual file upload endpoint
  async uploadFile(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const processingResult = await mockFileProcessing(file)
    
    return {
      success: true,
      timestamp: new Date(),
      data: {
        id: `file_${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.csv') ? 'csv' : 'database',
        status: 'completed',
        chunks: processingResult.chunks,
        indexed: processingResult.indexed,
        processingTime: processingResult.processingTime,
        extractedSections: processingResult.extractedSections
      }
    }
  },

  // TODO: Replace with actual persona management endpoint
  async updatePersona(personaId: string, config: any): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      timestamp: new Date(),
      data: { message: 'Persona updated successfully' }
    }
  }
}

// API exports - using real backend API
import { realApi } from './real-api'

export const api = {
  sendQuery: realApi.sendQuery,
  uploadFile: realApi.uploadFile,
  updatePersona: realApi.updatePersona,
  getPersonas: realApi.getPersonas,
  healthCheck: realApi.healthCheck
} 