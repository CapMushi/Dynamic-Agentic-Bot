"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Clock, Star, Trash2, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { QueryHistory, QueryType } from "@/lib/types"

interface QueryHistoryPanelProps {
  history: QueryHistory[]
  onQuerySelect: (query: string) => void
  onToggleFavorite: (id: string) => void
  onDeleteQuery: (id: string) => void
  onClearHistory: () => void
}

export function QueryHistoryPanel({
  history,
  onQuerySelect,
  onToggleFavorite,
  onDeleteQuery,
  onClearHistory
}: QueryHistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<QueryType | "all">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"timestamp" | "persona" | "type">("timestamp")

  // Get unique personas from history
  const uniquePersonas = useMemo(() => {
    const personas = new Set(history.map(h => h.persona))
    return Array.from(personas)
  }, [history])

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.response.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply persona filter
    if (selectedPersona !== "all") {
      filtered = filtered.filter(h => h.persona === selectedPersona)
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(h => h.queryType === selectedType)
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(h => h.favorite)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "persona":
          return a.persona.localeCompare(b.persona)
        case "type":
          return (a.queryType || "").localeCompare(b.queryType || "")
        default:
          return 0
      }
    })

    return filtered
  }, [history, searchTerm, selectedPersona, selectedType, showFavoritesOnly, sortBy])

  const handleCopyQuery = (query: string) => {
    navigator.clipboard.writeText(query)
  }

  const handleExportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `query-history-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getQueryTypeColor = (type?: QueryType) => {
    const colors = {
      'mathematical': '#00FF99',
      'factual': '#6B73FF',
      'conversational': '#FF6B6B'
    }
    return colors[type || 'conversational']
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>
          Query History
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportHistory}
            size="sm"
            variant="outline"
            style={{ backgroundColor: "transparent", borderColor: "#444444", color: "#B0B0B0" }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            onClick={onClearHistory}
            size="sm"
            variant="outline"
            style={{ backgroundColor: "transparent", borderColor: "#444444", color: "#B0B0B0" }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" style={{ color: "#B0B0B0" }} />
            <Input
              placeholder="Search queries and responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: "#2C2C2C", borderColor: "#444444", color: "#FFFFFF" }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedPersona} onValueChange={setSelectedPersona}>
              <SelectTrigger className="w-32" style={{ backgroundColor: "#2C2C2C", borderColor: "#444444", color: "#FFFFFF" }}>
                <SelectValue placeholder="Persona" style={{ color: "#FFFFFF" }} />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "#1A1F1C", borderColor: "#444444" }}>
                <SelectItem value="all" style={{ color: "#FFFFFF" }}>All Personas</SelectItem>
                {uniquePersonas.map(persona => (
                  <SelectItem key={persona} value={persona} style={{ color: "#FFFFFF" }}>{persona}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as QueryType | "all")}>
              <SelectTrigger className="w-32" style={{ backgroundColor: "#2C2C2C", borderColor: "#444444", color: "#FFFFFF" }}>
                <SelectValue placeholder="Type" style={{ color: "#FFFFFF" }} />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "#1A1F1C", borderColor: "#444444" }}>
                <SelectItem value="all" style={{ color: "#FFFFFF" }}>All Types</SelectItem>
                <SelectItem value="mathematical" style={{ color: "#FFFFFF" }}>Mathematical</SelectItem>
                <SelectItem value="factual" style={{ color: "#FFFFFF" }}>Factual</SelectItem>
                <SelectItem value="conversational" style={{ color: "#FFFFFF" }}>Conversational</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "timestamp" | "persona" | "type")}>
              <SelectTrigger className="w-32" style={{ backgroundColor: "#2C2C2C", borderColor: "#444444", color: "#FFFFFF" }}>
                <SelectValue placeholder="Sort by" style={{ color: "#FFFFFF" }} />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "#1A1F1C", borderColor: "#444444" }}>
                <SelectItem value="timestamp" style={{ color: "#FFFFFF" }}>Recent</SelectItem>
                <SelectItem value="persona" style={{ color: "#FFFFFF" }}>Persona</SelectItem>
                <SelectItem value="type" style={{ color: "#FFFFFF" }}>Type</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              size="sm"
              variant={showFavoritesOnly ? "default" : "outline"}
              style={{ 
                backgroundColor: showFavoritesOnly ? "#00FF99" : "transparent",
                borderColor: "#444444",
                color: showFavoritesOnly ? "#FFFFFF" : "#B0B0B0"
              }}
            >
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Clock className="h-4 w-4" />
            {filteredHistory.length} queries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="space-y-2 p-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: "#2C2C2C", borderColor: "#444444" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: getQueryTypeColor(item.queryType), color: "#FFFFFF" }}
                        >
                          {item.queryType || 'conversational'}
                        </Badge>
                        <span className="text-xs" style={{ color: "#B0B0B0" }}>
                          {item.persona}
                        </span>
                        <span className="text-xs" style={{ color: "#666666" }}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      
                      <p 
                        className="text-sm font-medium cursor-pointer hover:text-white transition-colors line-clamp-2"
                        style={{ color: "#FFFFFF" }}
                        onClick={() => onQuerySelect(item.query)}
                      >
                        {item.query}
                      </p>
                      
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: "#B0B0B0" }}>
                        {item.response.substring(0, 100)}...
                      </p>
                      
                      {item.processingTime && (
                        <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "#666666" }}>
                          <span>Processing: {item.processingTime}ms</span>
                          {item.citations && (
                            <span>Citations: {item.citations.length}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => onToggleFavorite(item.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        style={{ color: item.favorite ? "#FFD700" : "#B0B0B0" }}
                      >
                        <Star className="h-4 w-4" fill={item.favorite ? "currentColor" : "none"} />
                      </Button>
                      <Button
                        onClick={() => handleCopyQuery(item.query)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        style={{ color: "#B0B0B0" }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteQuery(item.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        style={{ color: "#B0B0B0" }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-2" style={{ color: "#666666" }} />
                  <p className="text-sm" style={{ color: "#B0B0B0" }}>
                    {history.length === 0 ? "No queries yet" : "No queries match your filters"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 