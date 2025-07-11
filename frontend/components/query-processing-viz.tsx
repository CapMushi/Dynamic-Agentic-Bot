"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Zap, 
  Route, 
  FileText, 
  Database, 
  Calculator, 
  Users, 
  MessageSquare, 
  Package,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { QueryTrace, QueryType } from '@/lib/types'

interface QueryProcessingVizProps {
  queryTrace: QueryTrace[]
  isProcessing: boolean
  queryType?: QueryType
  estimatedDuration?: number
}

const nodeIcons = {
  'Router Node': Route,
  'Document Node': FileText,
  'Database Node': Database,
  'Math Node': Calculator,
  'Persona Selector': Users,
  'Suggestion Node': MessageSquare,
  'Answer Formatter': Package,
  'UI': Zap
}

const nodeColors = {
  'Router Node': 'bg-blue-500',
  'Document Node': 'bg-green-500',
  'Database Node': 'bg-purple-500',
  'Math Node': 'bg-orange-500',
  'Persona Selector': 'bg-pink-500',
  'Suggestion Node': 'bg-yellow-500',
  'Answer Formatter': 'bg-indigo-500',
  'UI': 'bg-gray-500'
}

const queryTypeColors = {
  'mathematical': 'bg-orange-100 text-orange-800',
  'factual': 'bg-green-100 text-green-800',
  'conversational': 'bg-blue-100 text-blue-800'
}

export function QueryProcessingViz({ 
  queryTrace, 
  isProcessing, 
  queryType,
  estimatedDuration 
}: QueryProcessingVizProps) {
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isProcessing) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        setElapsedTime(elapsed)
        
        if (estimatedDuration) {
          const progressPercent = Math.min((elapsed / estimatedDuration) * 100, 95)
          setProgress(progressPercent)
        }
      }, 100)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
    }
  }, [isProcessing, estimatedDuration])

  const getNodeStatus = (step: string) => {
    const trace = queryTrace.find(t => t.step === step)
    if (!trace) return 'pending'
    return trace.status
  }

  const getNodeDuration = (step: string) => {
    const trace = queryTrace.find(t => t.step === step)
    return trace?.duration
  }

  const completedNodes = queryTrace.filter(t => t.status === 'completed').length
  const totalNodes = queryTrace.length || 1
  const completionPercentage = (completedNodes / totalNodes) * 100

  return (
    <Card className="w-full" style={{ backgroundColor: '#1A1F1C', borderColor: '#2C2C2C' }}>
      <CardHeader className="p-2 flex flex-col space-y-0.5">
        <CardTitle className="flex items-center gap-2 text-white text-base p-1 font-semibold tracking-tight">
          <Zap className="h-5 w-5" style={{ color: '#00FF99' }} />
          Query Processing Pipeline
          {queryType && (
            <Badge className={queryTypeColors[queryType]} variant="secondary" style={{ paddingTop: 1, paddingBottom: 1, fontSize: '0.75rem' }}>
              {queryType}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {/* Overall Progress */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Processing Progress</span>
            <span>{Math.round(isProcessing ? progress : completionPercentage)}%</span>
          </div>
          <Progress 
            value={isProcessing ? progress : completionPercentage} 
            className="h-2"
            style={{ backgroundColor: '#2C2C2C' }}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {isProcessing ? `${elapsedTime}ms elapsed` : `${completedNodes}/${totalNodes} nodes completed`}
            </span>
            {estimatedDuration && (
              <span>~{estimatedDuration}ms estimated</span>
            )}
          </div>
        </div>

        {/* Node Processing Steps */}
        {/* (Processing Nodes section removed as requested) */}
      </CardContent>
    </Card>
  )
} 