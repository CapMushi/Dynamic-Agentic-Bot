// Enhanced query processing hook for Phase 3
// This hook manages the query lifecycle with WebSocket simulation and error handling

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'
import { simulateQueryProcessing } from '@/lib/mock-data'
import { useWebSocket } from '@/lib/websocket'
import { useErrorHandler } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
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

  // Real WebSocket and error handling hooks
  const { startQueryTracing, on, off } = useWebSocket()
  const { executeWithRetry, createErrorMessage, handleError } = useErrorHandler()

  // Set up real-time trace updates from backend
  useEffect(() => {
    const handleTraceUpdate = (data: any) => {
      if (data.data?.traces) {
        setQueryTrace(data.data.traces)
      } else if (data.data?.trace) {
        // Handle individual trace updates
        setQueryTrace(prev => {
          const newTrace = data.data.trace
          const existing = prev.find(t => t.id === newTrace.id)
          if (existing) {
            return prev.map(t => t.id === newTrace.id ? newTrace : t)
          } else {
            return [...prev, newTrace]
          }
        })
      }
    }

    on('node_progress', handleTraceUpdate)
    on('query_complete', handleTraceUpdate)

    return () => {
      off('node_progress', handleTraceUpdate)
      off('query_complete', handleTraceUpdate)
    }
  }, [on, off])

  const sendQuery = useCallback(async (
    message: string, 
    persona: string, 
    files?: string[]
  ): Promise<ChatMessage | null> => {
    const startTime = Date.now()
    setIsProcessing(true)
    setQueryTrace([])

    try {
      // Analyze query before processing
      const { queryType: detectedType, estimatedDuration: estimatedDuration } = simulateQueryProcessing(message, persona)
      setQueryType(detectedType)
      setEstimatedDuration(estimatedDuration)

      // Start real-time WebSocket tracing
      await startQueryTracing(message, persona, detectedType)

      // Execute with retry logic
      const response = await executeWithRetry(
        async () => {
          const request: QueryRequest = {
            message,
            persona,
            files
          }
          return await api.sendQuery(request)
        },
        `query-${Date.now()}`,
        { maxRetries: 3 }
      )

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

      const duration = Date.now() - startTime
      logger.queryComplete(duration, true)
      logger.performance('query_processing', duration, { 
        messageLength: message.length, 
        persona, 
        hasFiles: !!files?.length 
      })

      return chatMessage

    } catch (error) {
      const duration = Date.now() - startTime
      logger.queryError(error)
      logger.performance('query_processing', duration, { 
        messageLength: message.length, 
        persona, 
        hasFiles: !!files?.length,
        error: true 
      })
      
      // Use enhanced error handling
      const errorContext = handleError(error, `query-${Date.now()}`)
      const errorMessage = createErrorMessage(errorContext, 0)
      
      // Mark current step as error
      setQueryTrace(prev => 
        prev.map(t => 
          t.status === 'processing' 
            ? { ...t, status: 'error' as const } 
            : t
        )
      )

      return errorMessage

    } finally {
      setIsProcessing(false)
    }
  }, [startQueryTracing, executeWithRetry, createErrorMessage, handleError])

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