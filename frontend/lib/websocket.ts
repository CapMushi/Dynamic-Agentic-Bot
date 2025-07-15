// Real WebSocket Client for Backend Connection
import { API_CONFIG, getWsUrl } from './config'
import type { QueryTrace, WebSocketEvent, QueryType } from './types'
import { logger } from './logger'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private isConnected = false
  private eventListeners = new Map<string, Function[]>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      const wsUrl = getWsUrl(API_CONFIG.ENDPOINTS.WEBSOCKET)
      logger.wsConnect(wsUrl)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        logger.wsConnected()
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected', { timestamp: new Date() })
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          logger.wsMessage(data.type, data.data)
          this.handleServerMessage(data)
        } catch (error) {
          logger.wsError(error)
        }
      }

      this.ws.onclose = () => {
        logger.wsDisconnected('Connection closed')
        this.isConnected = false
        this.emit('disconnected', { timestamp: new Date() })
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        logger.wsError(error)
        this.emit('error', { error, timestamp: new Date() })
      }
    } catch (error) {
      logger.wsError(error)
      this.handleReconnect()
    }
  }

  private handleServerMessage(data: any) {
    switch (data.type) {
      case 'query_trace':
        this.emit('node_progress', data)
        break
      case 'query_complete':
        this.emit('query_complete', data)
        break
      case 'error':
        this.emit('error', data)
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      logger.warn(`WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`, 'WS')
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      logger.error('Max WebSocket reconnection attempts reached', 'WS')
      this.emit('max_reconnect_attempts', { attempts: this.reconnectAttempts })
    }
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
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
  }

  // Start query tracing
  async startQueryTracing(message: string, persona: string, queryType: QueryType) {
    if (!this.isConnected) {
      logger.warn('WebSocket not connected, cannot start query tracing', 'WS')
      return
    }

    const traceMessage = {
      type: 'start_query_trace',
      data: {
        message,
        persona,
        queryType,
        timestamp: new Date().toISOString()
      }
    }

    logger.queryStart(message, persona)
    this.ws?.send(JSON.stringify(traceMessage))
  }

  // Send message to backend
  sendMessage(type: string, data: any) {
    if (!this.isConnected) {
      logger.warn('WebSocket not connected, cannot send message', 'WS')
      return
    }

    const message = {
      type,
      data,
      timestamp: new Date().toISOString()
    }

    logger.wsMessage(type, data)
    this.ws?.send(JSON.stringify(message))
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Close connection
  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient()

// Hook for using WebSocket in components
export function useWebSocket() {
  return {
    client: webSocketClient,
    startQueryTracing: webSocketClient.startQueryTracing.bind(webSocketClient),
    sendMessage: webSocketClient.sendMessage.bind(webSocketClient),
    on: webSocketClient.on.bind(webSocketClient),
    off: webSocketClient.off.bind(webSocketClient),
    getConnectionStatus: webSocketClient.getConnectionStatus.bind(webSocketClient)
  }
} 