"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { realApi } from '@/lib/real-api'
import { API_CONFIG } from '@/lib/config'

export function ConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const isHealthy = await realApi.healthCheck()
      
      if (isHealthy) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('failed')
        setError('Health check failed')
      }
    } catch (err) {
      setConnectionStatus('failed')
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Not Tested</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Backend Connection Test
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Test connection to backend server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Backend URL:</span>
            <span className="text-sm text-muted-foreground">{API_CONFIG.BASE_URL}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Status:</span>
            {getStatusBadge()}
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 