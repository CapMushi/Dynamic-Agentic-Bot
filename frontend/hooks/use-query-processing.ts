// Enhanced query processing hook for Phase 2
// This hook manages the query lifecycle and can be easily integrated with the backend LangGraph system

import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { simulateQueryProcessing } from '@/lib/mock-data'
import type { QueryRequest, QueryResponse } from '@/lib/api'
import type { QueryTrace, ChatMessage, QueryType, SuggestedQuery } from '@/lib/types'

export interface UseQueryProcessingReturn {
  isProcessing: boolean
  queryTrace: QueryTrace[]
  queryType: QueryType | null
  estimatedDuration: number | null
  suggestedQueries: SuggestedQuery[]
  sendQuery: (message: string, persona: string, files?: string[]) => Promise<ChatMessage | null>
  clearTrace: () => void
}

export function useQueryProcessing(): UseQueryProcessingReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [queryTrace, setQueryTrace] = useState<QueryTrace[]>([])
  const [queryType, setQueryType] = useState<QueryType | null>(null)
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null)
  const [suggestedQueries, setSuggestedQueries] = useState<SuggestedQuery[]>([])

  const sendQuery = useCallback(async (
    message: string, 
    persona: string, 
    files?: string[]
  ): Promise<ChatMessage | null> => {
    setIsProcessing(true)
    setQueryTrace([])

    try {
      // Analyze query before processing
      const { queryType: detectedType, estimatedDuration: duration } = simulateQueryProcessing(message, persona)
      setQueryType(detectedType)
      setEstimatedDuration(duration)

      // Send query to API
      const request: QueryRequest = {
        message,
        persona,
        files
      }

      const response = await api.sendQuery(request)

      if (!response.success) {
        throw new Error(response.error || 'Query failed')
      }

      // Set the trace from response
      setQueryTrace(response.data.processingTrace?.map((trace, index) => ({
        ...trace,
        id: `${index + 1}`,
        step: trace.step as QueryTrace['step']
      })) || [])
      
      // Set suggested queries
      setSuggestedQueries(response.data.suggestedQueries || [])

      // Create chat message from response
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.data.response,
        persona,
        citations: response.data.citations,
        timestamp: new Date(),
        processingTime: response.data.processingTime
      }

      return chatMessage

    } catch (error) {
      console.error('Query processing error:', error)
      
      // Mark current step as error
      setQueryTrace(prev => 
        prev.map(t => 
          t.status === 'processing' 
            ? { ...t, status: 'error' as const } 
            : t
        )
      )

      // Return error message
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date()
      }

    } finally {
      setIsProcessing(false)
    }
  }, [])

  const clearTrace = useCallback(() => {
    setQueryTrace([])
    setQueryType(null)
    setEstimatedDuration(null)
  }, [])

  return {
    isProcessing,
    queryTrace,
    queryType,
    estimatedDuration,
    suggestedQueries,
    sendQuery,
    clearTrace
  }
} 