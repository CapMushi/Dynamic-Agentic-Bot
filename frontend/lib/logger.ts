// Frontend Logger Utility
// Provides structured logging for browser console with proper formatting

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: any
  timestamp: Date
  sessionId?: string
}

class Logger {
  private sessionId: string
  private isDevelopment: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const context = entry.context ? `[${entry.context}]` : ''
    const session = `[${this.sessionId}]`
    
    return `${timestamp} ${session} ${context} ${entry.message}`
  }

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
      sessionId: this.sessionId
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, data || '')
        }
        break
      case LogLevel.INFO:
        console.info(formattedMessage, data || '')
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '')
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '')
        break
    }
  }

  // API Connection Logging
  apiConnect(url: string) {
    this.log(LogLevel.INFO, `Connecting to API`, 'API', { url })
  }

  apiRequest(method: string, endpoint: string, data?: any) {
    this.log(LogLevel.INFO, `${method} ${endpoint}`, 'API', { 
      method, 
      endpoint, 
      hasData: !!data 
    })
  }

  apiResponse(method: string, endpoint: string, status: number, duration?: number) {
    this.log(LogLevel.INFO, `${method} ${endpoint} → ${status}`, 'API', { 
      method, 
      endpoint, 
      status, 
      duration 
    })
  }

  apiError(method: string, endpoint: string, error: any) {
    this.log(LogLevel.ERROR, `${method} ${endpoint} failed`, 'API', { 
      method, 
      endpoint, 
      error: error.message || error 
    })
  }

  // WebSocket Logging
  wsConnect(url: string) {
    this.log(LogLevel.INFO, `WebSocket connecting`, 'WS', { url })
  }

  wsConnected() {
    this.log(LogLevel.INFO, `WebSocket connected`, 'WS')
  }

  wsDisconnected(reason?: string) {
    this.log(LogLevel.WARN, `WebSocket disconnected`, 'WS', { reason })
  }

  wsMessage(type: string, data?: any) {
    this.log(LogLevel.DEBUG, `WebSocket message: ${type}`, 'WS', { type, hasData: !!data })
  }

  wsError(error: any) {
    this.log(LogLevel.ERROR, `WebSocket error`, 'WS', { error: error.message || error })
  }

  // Query Processing Logging
  queryStart(message: string, persona: string) {
    this.log(LogLevel.INFO, `Query started`, 'QUERY', { 
      message: message.substring(0, 50) + '...', 
      persona 
    })
  }

  queryNodeProgress(node: string, status: string) {
    this.log(LogLevel.DEBUG, `Node progress: ${node} → ${status}`, 'QUERY', { node, status })
  }

  queryComplete(duration: number, success: boolean) {
    this.log(LogLevel.INFO, `Query completed`, 'QUERY', { duration, success })
  }

  queryError(error: any) {
    this.log(LogLevel.ERROR, `Query failed`, 'QUERY', { error: error.message || error })
  }

  // File Upload Logging
  fileUploadStart(fileName: string, fileSize: number) {
    this.log(LogLevel.INFO, `File upload started`, 'UPLOAD', { fileName, fileSize })
  }

  fileUploadProgress(fileName: string, progress: number) {
    this.log(LogLevel.DEBUG, `File upload progress`, 'UPLOAD', { fileName, progress })
  }

  fileUploadComplete(fileName: string, fileId: string) {
    this.log(LogLevel.INFO, `File upload completed`, 'UPLOAD', { fileName, fileId })
  }

  fileUploadError(fileName: string, error: any) {
    this.log(LogLevel.ERROR, `File upload failed`, 'UPLOAD', { fileName, error: error.message || error })
  }

  // Persona Management Logging
  personaSwitch(personaId: string, personaName: string) {
    this.log(LogLevel.INFO, `Persona switched`, 'PERSONA', { personaId, personaName })
  }

  personaUpdate(personaId: string, updates: any) {
    this.log(LogLevel.INFO, `Persona updated`, 'PERSONA', { personaId, updates })
  }

  // Error Logging
  error(message: string, error: any, context?: string) {
    this.log(LogLevel.ERROR, message, context, { error: error.message || error })
  }

  warn(message: string, data?: any, context?: string) {
    this.log(LogLevel.WARN, message, context, data)
  }

  info(message: string, data?: any, context?: string) {
    this.log(LogLevel.INFO, message, context, data)
  }

  debug(message: string, data?: any, context?: string) {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  // Session Management
  getSessionId(): string {
    return this.sessionId
  }

  // Performance Logging
  performance(operation: string, duration: number, data?: any) {
    this.log(LogLevel.INFO, `Performance: ${operation}`, 'PERF', { operation, duration, ...data })
  }
}

// Export singleton instance
export const logger = new Logger()

// Hook for using logger in components
export function useLogger() {
  return logger
} 