// Local Storage Service for Phase 3 - Query History and Settings Persistence
// This service handles all client-side data persistence

import type { QueryHistory, LLMProvider, ErrorHandlingConfig, PerformanceConfig } from './types'

const STORAGE_KEYS = {
  QUERY_HISTORY: 'das_query_history',
  LLM_PROVIDERS: 'das_llm_providers',
  ERROR_CONFIG: 'das_error_config',
  PERFORMANCE_CONFIG: 'das_performance_config',
  USER_PREFERENCES: 'das_user_preferences'
} as const

export class StorageService {
  private static instance: StorageService
  private isClient = typeof window !== 'undefined'

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // Generic storage methods
  private setItem(key: string, value: any): void {
    if (!this.isClient) return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  }

  private removeItem(key: string): void {
    if (!this.isClient) return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  // Query History Management
  saveQueryHistory(history: QueryHistory[]): void {
    // Keep only last 1000 queries for performance
    const limitedHistory = history.slice(-1000)
    this.setItem(STORAGE_KEYS.QUERY_HISTORY, limitedHistory)
  }

  getQueryHistory(): QueryHistory[] {
    const history = this.getItem<QueryHistory[]>(STORAGE_KEYS.QUERY_HISTORY, [])
    
    // Convert string dates back to Date objects
    return history.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }))
  }

  addQueryToHistory(query: QueryHistory): void {
    const history = this.getQueryHistory()
    history.push(query)
    this.saveQueryHistory(history)
  }

  removeQueryFromHistory(queryId: string): void {
    const history = this.getQueryHistory()
    const filteredHistory = history.filter(item => item.id !== queryId)
    this.saveQueryHistory(filteredHistory)
  }

  toggleQueryFavorite(queryId: string): void {
    const history = this.getQueryHistory()
    const updatedHistory = history.map(item => 
      item.id === queryId ? { ...item, favorite: !item.favorite } : item
    )
    this.saveQueryHistory(updatedHistory)
  }

  clearQueryHistory(): void {
    this.removeItem(STORAGE_KEYS.QUERY_HISTORY)
  }

  // LLM Provider Management
  saveLLMProviders(providers: LLMProvider[]): void {
    this.setItem(STORAGE_KEYS.LLM_PROVIDERS, providers)
  }

  getLLMProviders(): LLMProvider[] {
    return this.getItem<LLMProvider[]>(STORAGE_KEYS.LLM_PROVIDERS, [])
  }

  addLLMProvider(provider: LLMProvider): void {
    const providers = this.getLLMProviders()
    providers.push(provider)
    this.saveLLMProviders(providers)
  }

  updateLLMProvider(id: string, updates: Partial<LLMProvider>): void {
    const providers = this.getLLMProviders()
    const updatedProviders = providers.map(provider => 
      provider.id === id ? { ...provider, ...updates } : provider
    )
    this.saveLLMProviders(updatedProviders)
  }

  removeLLMProvider(id: string): void {
    const providers = this.getLLMProviders()
    const filteredProviders = providers.filter(provider => provider.id !== id)
    this.saveLLMProviders(filteredProviders)
  }

  // Error Handling Configuration
  saveErrorConfig(config: ErrorHandlingConfig): void {
    this.setItem(STORAGE_KEYS.ERROR_CONFIG, config)
  }

  getErrorConfig(): ErrorHandlingConfig {
    return this.getItem<ErrorHandlingConfig>(STORAGE_KEYS.ERROR_CONFIG, {
      maxRetries: 3,
      retryDelay: 1000,
      timeoutMs: 30000,
      fallbackResponse: 'I apologize, but I encountered an error processing your request. Please try again.'
    })
  }

  // Performance Configuration
  savePerformanceConfig(config: PerformanceConfig): void {
    this.setItem(STORAGE_KEYS.PERFORMANCE_CONFIG, config)
  }

  getPerformanceConfig(): PerformanceConfig {
    return this.getItem<PerformanceConfig>(STORAGE_KEYS.PERFORMANCE_CONFIG, {
      maxDocuments: 1000,
      chunkSize: 1000,
      indexingBatchSize: 100,
      queryTimeout: 30000
    })
  }

  // User Preferences
  saveUserPreferences(preferences: Record<string, any>): void {
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences)
  }

  getUserPreferences(): Record<string, any> {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.USER_PREFERENCES, {})
  }

  // Bulk operations
  exportAllData(): Record<string, any> {
    if (!this.isClient) return {}

    return {
      queryHistory: this.getQueryHistory(),
      llmProviders: this.getLLMProviders(),
      errorConfig: this.getErrorConfig(),
      performanceConfig: this.getPerformanceConfig(),
      userPreferences: this.getUserPreferences(),
      exportedAt: new Date().toISOString()
    }
  }

  importData(data: Record<string, any>): boolean {
    if (!this.isClient) return false

    try {
      if (data.queryHistory) {
        this.saveQueryHistory(data.queryHistory)
      }
      if (data.llmProviders) {
        this.saveLLMProviders(data.llmProviders)
      }
      if (data.errorConfig) {
        this.saveErrorConfig(data.errorConfig)
      }
      if (data.performanceConfig) {
        this.savePerformanceConfig(data.performanceConfig)
      }
      if (data.userPreferences) {
        this.saveUserPreferences(data.userPreferences)
      }
      
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  clearAllData(): void {
    if (!this.isClient) return

    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key)
    })
  }

  // Storage usage information
  getStorageUsage(): { used: number, available: number } {
    if (!this.isClient) return { used: 0, available: 0 }

    try {
      let used = 0
      
      // Calculate used space
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('das_')) {
          used += localStorage.getItem(key)?.length || 0
        }
      }

      // Estimate available space (browsers typically allow ~5-10MB for localStorage)
      const estimated = 5 * 1024 * 1024 // 5MB in bytes
      const available = Math.max(0, estimated - used)

      return { used, available }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
      return { used: 0, available: 0 }
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance()

// React hooks for storage operations
export function useQueryHistory() {
  const saveHistory = (history: QueryHistory[]) => storageService.saveQueryHistory(history)
  const getHistory = () => storageService.getQueryHistory()
  const addQuery = (query: QueryHistory) => storageService.addQueryToHistory(query)
  const removeQuery = (id: string) => storageService.removeQueryFromHistory(id)
  const toggleFavorite = (id: string) => storageService.toggleQueryFavorite(id)
  const clearHistory = () => storageService.clearQueryHistory()

  return {
    saveHistory,
    getHistory,
    addQuery,
    removeQuery,
    toggleFavorite,
    clearHistory
  }
}

export function useLLMProviders() {
  const saveProviders = (providers: LLMProvider[]) => storageService.saveLLMProviders(providers)
  const getProviders = () => storageService.getLLMProviders()
  const addProvider = (provider: LLMProvider) => storageService.addLLMProvider(provider)
  const updateProvider = (id: string, updates: Partial<LLMProvider>) => storageService.updateLLMProvider(id, updates)
  const removeProvider = (id: string) => storageService.removeLLMProvider(id)

  return {
    saveProviders,
    getProviders,
    addProvider,
    updateProvider,
    removeProvider
  }
} 