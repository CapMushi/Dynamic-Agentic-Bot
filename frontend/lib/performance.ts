// Performance Optimization Service for Phase 3
// This service provides optimizations for large document sets and complex queries

import { storageService } from './storage'
import type { PerformanceConfig, UploadedFile, QueryHistory } from './types'

export interface PerformanceMetrics {
  queryProcessingTime: number
  documentIndexingTime: number
  memoryUsage: number
  cacheHitRate: number
  averageResponseTime: number
  lastUpdated: Date
}

export interface CacheEntry<T> {
  data: T
  timestamp: Date
  ttl: number
  hits: number
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private config: PerformanceConfig
  private cache = new Map<string, CacheEntry<any>>()
  private metrics: PerformanceMetrics = {
    queryProcessingTime: 0,
    documentIndexingTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    lastUpdated: new Date()
  }
  private performanceHistory: Array<{ timestamp: Date; metric: string; value: number }> = []

  private constructor() {
    this.config = storageService.getPerformanceConfig()
    this.startPerformanceMonitoring()
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Update performance configuration
  updateConfig(config: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...config }
    storageService.savePerformanceConfig(this.config)
  }

  // Document processing optimization
  optimizeDocumentProcessing(files: UploadedFile[]): {
    batchedFiles: UploadedFile[][]
    estimatedProcessingTime: number
    recommendations: string[]
  } {
    const recommendations: string[] = []
    
    // Check if we're exceeding the maximum document limit
    if (files.length > this.config.maxDocuments) {
      recommendations.push(`Consider reducing document count to ${this.config.maxDocuments} for optimal performance`)
    }

    // Sort files by size for optimal processing order
    const sortedFiles = [...files].sort((a, b) => {
      const sizeA = parseFloat(a.size)
      const sizeB = parseFloat(b.size)
      return sizeA - sizeB // Process smaller files first
    })

    // Create batches based on batch size configuration
    const batchedFiles: UploadedFile[][] = []
    for (let i = 0; i < sortedFiles.length; i += this.config.indexingBatchSize) {
      batchedFiles.push(sortedFiles.slice(i, i + this.config.indexingBatchSize))
    }

    // Estimate processing time
    const estimatedProcessingTime = this.estimateProcessingTime(files)

    // Add size-based recommendations
    const totalSize = files.reduce((sum, file) => sum + parseFloat(file.size), 0)
    if (totalSize > 100) { // 100MB threshold
      recommendations.push('Large file sizes detected. Consider splitting documents for better performance.')
    }

    return {
      batchedFiles,
      estimatedProcessingTime,
      recommendations
    }
  }

  // Query optimization
  optimizeQuery(query: string, history: QueryHistory[]): {
    optimizedQuery: string
    cacheKey: string
    shouldUseCache: boolean
    estimatedTime: number
  } {
    // Generate cache key based on query and context
    const cacheKey = this.generateCacheKey(query)
    
    // Check if similar queries exist in cache
    const shouldUseCache = this.cache.has(cacheKey)
    
    // Optimize query text (remove redundant words, normalize)
    const optimizedQuery = this.optimizeQueryText(query)
    
    // Estimate processing time based on query complexity
    const estimatedTime = this.estimateQueryTime(optimizedQuery, history)

    return {
      optimizedQuery,
      cacheKey,
      shouldUseCache,
      estimatedTime
    }
  }

  // Caching system
  setCache<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
      hits: 0
    })
    
    // Clean expired cache entries
    this.cleanExpiredCache()
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Increment hit count
    entry.hits++
    this.updateCacheHitRate()
    
    return entry.data
  }

  // Memory optimization
  optimizeMemoryUsage(): void {
    // Clear expired cache entries
    this.cleanExpiredCache()
    
    // Limit performance history size
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-500)
    }
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc()
    }
  }

  // Performance monitoring
  private startPerformanceMonitoring(): void {
    // Monitor performance every 30 seconds
    setInterval(() => {
      this.updateMetrics()
    }, 30000)
  }

  private updateMetrics(): void {
    // Update cache hit rate
    this.updateCacheHitRate()
    
    // Update memory usage (approximation)
    this.metrics.memoryUsage = this.estimateMemoryUsage()
    
    // Update average response time
    this.metrics.averageResponseTime = this.calculateAverageResponseTime()
    
    this.metrics.lastUpdated = new Date()
  }

  private updateCacheHitRate(): void {
    const totalQueries = this.performanceHistory.filter(h => h.metric === 'query').length
    const cacheHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0)
    
    this.metrics.cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage based on cache size and other factors
    let memoryUsage = 0
    
    // Cache memory
    this.cache.forEach((entry) => {
      memoryUsage += JSON.stringify(entry.data).length
    })
    
    // Performance history memory
    memoryUsage += this.performanceHistory.length * 100 // Approximate size per entry
    
    return memoryUsage
  }

  private calculateAverageResponseTime(): number {
    const responseTimes = this.performanceHistory
      .filter(h => h.metric === 'responseTime')
      .slice(-50) // Last 50 responses
      .map(h => h.value)
    
    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0
  }

  // Utility methods
  private generateCacheKey(query: string): string {
    // Create a hash-like key for the query
    return btoa(query.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
  }

  private optimizeQueryText(query: string): string {
    // Remove common stop words and normalize
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    
    return query
      .toLowerCase()
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .join(' ')
      .trim()
  }

  private estimateQueryTime(query: string, history: QueryHistory[]): number {
    // Base time estimation
    let baseTime = 1000 // 1 second base
    
    // Add time based on query complexity
    baseTime += query.split(' ').length * 50 // 50ms per word
    
    // Check historical data for similar queries
    const similarQueries = history.filter(h => 
      h.query.toLowerCase().includes(query.toLowerCase()) || 
      query.toLowerCase().includes(h.query.toLowerCase())
    )
    
    if (similarQueries.length > 0) {
      const avgTime = similarQueries.reduce((sum, q) => sum + (q.processingTime || 0), 0) / similarQueries.length
      baseTime = Math.max(baseTime, avgTime)
    }
    
    return baseTime
  }

  private estimateProcessingTime(files: UploadedFile[]): number {
    // Estimate based on file count and sizes
    const totalSize = files.reduce((sum, file) => sum + parseFloat(file.size), 0)
    const baseTime = files.length * 2000 // 2 seconds per file
    const sizeTime = totalSize * 100 // 100ms per MB
    
    return Math.round(baseTime + sizeTime)
  }

  private cleanExpiredCache(): void {
    const now = Date.now()
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key)
      }
    })
  }

  // Public API methods
  recordPerformanceMetric(metric: string, value: number): void {
    this.performanceHistory.push({
      timestamp: new Date(),
      metric,
      value
    })
    
    // Update specific metrics
    switch (metric) {
      case 'queryProcessingTime':
        this.metrics.queryProcessingTime = value
        break
      case 'documentIndexingTime':
        this.metrics.documentIndexingTime = value
        break
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = []
    
    // Cache performance
    if (this.metrics.cacheHitRate < 20) {
      recommendations.push('Cache hit rate is low. Consider optimizing query patterns.')
    }
    
    // Memory usage
    if (this.metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
      recommendations.push('High memory usage detected. Consider clearing cache or reducing document count.')
    }
    
    // Response time
    if (this.metrics.averageResponseTime > 5000) { // 5 seconds
      recommendations.push('Response times are high. Consider optimizing queries or increasing timeout values.')
    }
    
    return recommendations
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; entries: number; hitRate: number } {
    return {
      size: this.estimateMemoryUsage(),
      entries: this.cache.size,
      hitRate: this.metrics.cacheHitRate
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()

// React hook for performance optimization
export function usePerformanceOptimization() {
  const optimizeQuery = (query: string, history: QueryHistory[]) => {
    return performanceOptimizer.optimizeQuery(query, history)
  }

  const optimizeDocumentProcessing = (files: UploadedFile[]) => {
    return performanceOptimizer.optimizeDocumentProcessing(files)
  }

  const recordMetric = (metric: string, value: number) => {
    performanceOptimizer.recordPerformanceMetric(metric, value)
  }

  const getMetrics = () => {
    return performanceOptimizer.getPerformanceMetrics()
  }

  const getRecommendations = () => {
    return performanceOptimizer.getPerformanceRecommendations()
  }

  const setCache = <T>(key: string, data: T, ttl?: number) => {
    performanceOptimizer.setCache(key, data, ttl)
  }

  const getCache = <T>(key: string) => {
    return performanceOptimizer.getCache<T>(key)
  }

  return {
    optimizeQuery,
    optimizeDocumentProcessing,
    recordMetric,
    getMetrics,
    getRecommendations,
    setCache,
    getCache
  }
} 