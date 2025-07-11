// WebSocket Simulation Service for Phase 3
// This service simulates real-time query tracing through the 8-node LangGraph system

import { io, Socket } from 'socket.io-client'
import type { QueryTrace, WebSocketEvent, QueryType } from './types'

// LangGraph node sequence as defined in the project document
const NODE_SEQUENCE = [
  'Router Node',
  'Persona Selector', 
  'Document Node',
  'Database Node',
  'Math Node',
  'Suggestion Node',
  'Answer Formatter'
] as const

export class WebSocketSimulation {
  private socket: Socket | null = null
  private isSimulating = false
  private eventListeners = new Map<string, Function[]>()

  constructor(private serverUrl: string = 'ws://localhost:3001') {
    // Initialize socket connection simulation
    this.initializeSocketSimulation()
  }

  private initializeSocketSimulation() {
    // For development, we'll simulate the WebSocket behavior
    // In production, this would connect to the actual backend
    console.log('Initializing WebSocket simulation for query tracing')
  }

  // Add event listener for real-time updates
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  // Remove event listener
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Emit event to all listeners
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => callback(data))
  }

  // Start real-time query tracing simulation
  async startQueryTracing(query: string, persona: string, queryType: QueryType): Promise<void> {
    if (this.isSimulating) {
      console.warn('Query tracing already in progress')
      return
    }

    this.isSimulating = true
    
    // Emit query start event
    this.emit('query_start', {
      id: Date.now().toString(),
      query,
      persona,
      queryType,
      timestamp: new Date()
    })

    // Simulate progression through each node
    const traces: QueryTrace[] = []
    
    for (let i = 0; i < NODE_SEQUENCE.length; i++) {
      const step = NODE_SEQUENCE[i]
      const traceId = `${Date.now()}-${i}`
      
      // Start processing this node
      const trace: QueryTrace = {
        id: traceId,
        step,
        status: 'processing',
        timestamp: new Date()
      }
      
      traces.push(trace)
      
      // Emit progress update
      this.emit('node_progress', {
        id: traceId,
        type: 'node_progress',
        data: {
          step,
          status: 'processing',
          progress: ((i + 1) / NODE_SEQUENCE.length) * 100,
          traces: [...traces]
        },
        timestamp: new Date()
      })

      // Simulate processing time based on node type
      const processingTime = this.getProcessingTime(step, queryType)
      await this.delay(processingTime)

      // Complete this node
      trace.status = 'completed'
      trace.duration = processingTime
      
      // Emit completion update
      this.emit('node_progress', {
        id: traceId,
        type: 'node_progress',
        data: {
          step,
          status: 'completed',
          duration: processingTime,
          progress: ((i + 1) / NODE_SEQUENCE.length) * 100,
          traces: [...traces]
        },
        timestamp: new Date()
      })
    }

    // Emit query complete event
    this.emit('query_complete', {
      id: Date.now().toString(),
      type: 'query_complete',
      data: {
        traces,
        totalTime: traces.reduce((sum, t) => sum + (t.duration || 0), 0),
        success: true
      },
      timestamp: new Date()
    })

    this.isSimulating = false
  }

  // Get realistic processing time based on node type and query type
  private getProcessingTime(step: string, queryType: QueryType): number {
    const baseTime = {
      'Router Node': 100,
      'Persona Selector': 80,
      'Document Node': 800,
      'Database Node': 400,
      'Math Node': 600,
      'Suggestion Node': 200,
      'Answer Formatter': 150
    }[step] || 200

    // Adjust based on query type
    const multiplier = {
      'mathematical': 1.5,
      'factual': 1.2,
      'conversational': 0.8
    }[queryType] || 1

    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4
    
    return Math.round(baseTime * multiplier * randomFactor)
  }

  // Simulate connection error
  simulateError(step: string, error: string) {
    this.emit('error', {
      id: Date.now().toString(),
      type: 'error',
      data: {
        step,
        error,
        timestamp: new Date()
      },
      timestamp: new Date()
    })
  }

  // Check if currently simulating
  isTracing(): boolean {
    return this.isSimulating
  }

  // Disconnect simulation
  disconnect() {
    this.isSimulating = false
    this.eventListeners.clear()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const webSocketSimulation = new WebSocketSimulation()

// React hook for WebSocket simulation
export function useWebSocketSimulation() {
  return {
    startQueryTracing: webSocketSimulation.startQueryTracing.bind(webSocketSimulation),
    on: webSocketSimulation.on.bind(webSocketSimulation),
    off: webSocketSimulation.off.bind(webSocketSimulation),
    isTracing: webSocketSimulation.isTracing.bind(webSocketSimulation),
    disconnect: webSocketSimulation.disconnect.bind(webSocketSimulation)
  }
} 