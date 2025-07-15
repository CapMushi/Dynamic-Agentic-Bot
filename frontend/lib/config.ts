// API Configuration for Frontend-Backend Connection
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  ENDPOINTS: {
    QUERY: '/api/query',
    UPLOAD: '/api/upload',
    PERSONAS: '/api/personas',
    HEALTH: '/api/health',
    WEBSOCKET: '/ws'
  }
}

export const getApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`
export const getWsUrl = (endpoint: string) => `${API_CONFIG.WS_URL}${endpoint}`

export const isBackendConnected = () => {
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_BACKEND === 'true'
} 