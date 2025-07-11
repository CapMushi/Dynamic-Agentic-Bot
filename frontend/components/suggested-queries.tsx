"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, TrendingUp, FileText, MessageCircle, Sparkles } from 'lucide-react'
import type { SuggestedQuery, QueryType } from '@/lib/types'

interface SuggestedQueriesProps {
  suggestions: SuggestedQuery[]
  onSelectQuery: (query: string) => void
  persona: string
  isProcessing?: boolean
}

const queryTypeIcons = {
  'mathematical': TrendingUp,
  'factual': FileText,
  'conversational': MessageCircle
}

const queryTypeColors = {
  'mathematical': 'bg-orange-100 text-orange-800 border-orange-200',
  'factual': 'bg-green-100 text-green-800 border-green-200',
  'conversational': 'bg-blue-100 text-blue-800 border-blue-200'
}

const confidenceColors = {
  high: 'bg-green-500',
  medium: 'bg-yellow-500',
  low: 'bg-red-500'
}

const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

export function SuggestedQueries({ 
  suggestions, 
  onSelectQuery, 
  persona, 
  isProcessing = false 
}: SuggestedQueriesProps) {
  // Sort suggestions by confidence
  const sortedSuggestions = [...suggestions].sort((a, b) => b.confidence - a.confidence)
  
  // Group suggestions by category
  const groupedSuggestions = sortedSuggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = []
    }
    acc[suggestion.category].push(suggestion)
    return acc
  }, {} as Record<QueryType, SuggestedQuery[]>)

  return (
    <Card className="w-full" style={{ backgroundColor: '#1A1F1C', borderColor: '#2C2C2C' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" style={{ color: '#00FF99' }} />
          Suggested Queries
          <Badge variant="secondary" className="ml-2 text-xs">
            {persona}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSuggestions).map(([category, queries]) => {
          const IconComponent = queryTypeIcons[category as QueryType] || MessageSquare
          const categoryColor = queryTypeColors[category as QueryType] || 'bg-gray-100 text-gray-800'
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {category} Queries
                </span>
                <Badge className={`text-xs ${categoryColor}`} variant="outline">
                  {queries.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {queries.map((suggestion) => {
                  const confidenceLevel = getConfidenceLevel(suggestion.confidence)
                  const confidenceColor = confidenceColors[confidenceLevel]
                  
                  return (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-gray-800 transition-colors"
                      style={{ 
                        backgroundColor: '#2C2C2C', 
                        borderColor: '#2C2C2C',
                        color: '#FFFFFF'
                      }}
                      onClick={() => onSelectQuery(suggestion.text)}
                      disabled={isProcessing}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#00FF99'
                        e.currentTarget.style.borderColor = '#00FF99'
                        e.currentTarget.style.color = '#000000'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2C2C2C'
                        e.currentTarget.style.borderColor = '#2C2C2C'
                        e.currentTarget.style.color = '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${confidenceColor}`}
                            title={`${Math.round(suggestion.confidence * 100)}% confidence`}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-relaxed">
                            {suggestion.text}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`text-xs ${queryTypeColors[suggestion.category]}`}
                              variant="outline"
                            >
                              {suggestion.category}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {Math.round(suggestion.confidence * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )
        })}
        
        {suggestions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No suggestions available</p>
            <p className="text-xs mt-1">Start a conversation to see personalized query suggestions</p>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="pt-3 border-t border-gray-600">
          <p className="text-xs text-gray-400 mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ 
                backgroundColor: '#2C2C2C', 
                borderColor: '#2C2C2C',
                color: '#B0B0B0'
              }}
              onClick={() => onSelectQuery("What can you help me with?")}
              disabled={isProcessing}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00FF99'
                e.currentTarget.style.borderColor = '#00FF99'
                e.currentTarget.style.color = '#000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2C2C2C'
                e.currentTarget.style.borderColor = '#2C2C2C'
                e.currentTarget.style.color = '#B0B0B0'
              }}
            >
              Get Help
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ 
                backgroundColor: '#2C2C2C', 
                borderColor: '#2C2C2C',
                color: '#B0B0B0'
              }}
              onClick={() => onSelectQuery("Summarize uploaded documents")}
              disabled={isProcessing}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00FF99'
                e.currentTarget.style.borderColor = '#00FF99'
                e.currentTarget.style.color = '#000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2C2C2C'
                e.currentTarget.style.borderColor = '#2C2C2C'
                e.currentTarget.style.color = '#B0B0B0'
              }}
            >
              Summarize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 