"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Copy, User, Zap, Mic } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { QueryProcessingViz } from "./query-processing-viz"
import { SuggestedQueries } from "./suggested-queries"
import type { ChatMessage, Persona, QueryTrace, QueryType, SuggestedQuery } from "@/lib/types"

interface ChatPanelProps {
  messages: ChatMessage[]
  queryTrace: QueryTrace[]
  activePersona?: Persona
  isProcessing?: boolean
  queryType?: QueryType
  estimatedDuration?: number
  suggestedQueries?: SuggestedQuery[]
  onSendMessage: (content: string) => void
  onMetadataSelect: (metadata: any) => void
}

export function ChatPanel({ 
  messages, 
  queryTrace, 
  activePersona, 
  isProcessing = false,
  queryType,
  estimatedDuration,
  suggestedQueries = [],
  onSendMessage, 
  onMetadataSelect 
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = [
    "What are the key financial metrics for Q3?",
    "Show me the revenue breakdown by segment",
    "What compliance issues should I be aware of?",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleCitationClick = (citation: any) => {
    // Generate PDF URL if it's a PDF document
    const pdfUrl = citation.title.endsWith('.pdf') 
      ? `http://localhost:8000/api/files/pdf/${citation.title}`
      : undefined
    
    onMetadataSelect({
      title: citation.title,
      section: citation.section,
      page: citation.page,
      previewUrl: citation.screenshot || "/placeholder.svg?height=400&width=300",
      confidence: citation.confidence,
      content: citation.content,
      pdfUrl: pdfUrl
    })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b" style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: "#E0FFE5" }}>
            AI Chat Interface
          </h2>
          {activePersona && (
            <Badge
              variant="secondary"
              className="flex items-center gap-2 text-white"
              style={{ backgroundColor: "#00FF99" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00FF99" }} />
              {activePersona.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Messages (flex-1) */}
      <div className="flex-1 flex flex-col min-h-0" style={{ backgroundColor: "#0C0C0C" }}>
        <div className="flex-1 p-4 overflow-y-auto min-h-0" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 w-full ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {message.type === "user" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#00FF99" }}
                    >
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <Card
                    style={{
                      backgroundColor: message.type === "user" ? "#2C2C2C" : "#1A1F1C",
                      borderColor: "#2C2C2C",
                    }}
                  >
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap" style={{ color: "#FFFFFF" }}>
                        {message.content}
                      </p>

                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#2C2C2C" }}>
                          <p className="text-sm font-medium mb-2" style={{ color: "#B0B0B0" }}>
                            Sources:
                          </p>
                          <div className="space-y-1">
                            {message.citations.map((citation, index) => (
                              <button
                                key={index}
                                onClick={() => handleCitationClick(citation)}
                                className="block text-left p-2 rounded text-sm hover:text-white transition-colors w-full border"
                                style={{
                                  backgroundColor: "#2C2C2C",
                                  borderColor: "#2C2C2C",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#00FF99"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#2C2C2C"
                                }}
                              >
                                <span className="font-medium" style={{ color: "#FFFFFF" }}>
                                  {citation.title}
                                </span>
                                <span style={{ color: "#B0B0B0" }}>
                                  {" "}
                                  - {citation.section}, Page {citation.page}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.type === "assistant" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="hover:text-white"
                            style={{ color: "#B0B0B0" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#2C2C2C"
                              e.currentTarget.style.color = "#00FF99"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent"
                              e.currentTarget.style.color = "#B0B0B0"
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Query Processing Panel (only) */}
        {(queryTrace.length > 0 || isProcessing) && (
          <div className="flex-shrink-0 border-t" style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
            <div className="px-4 py-2">
              <QueryProcessingViz
                queryTrace={queryTrace}
                isProcessing={isProcessing}
                queryType={queryType}
                estimatedDuration={estimatedDuration}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 px-4 py-2 border-t" style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <p className="text-sm font-medium mb-2" style={{ color: "#FFFFFF" }}>
          Suggested questions:
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(question)}
              className="text-xs hover:text-white transition-colors"
              style={{
                backgroundColor: "#2C2C2C",
                borderColor: "#2C2C2C",
                color: "#B0B0B0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#00FF99"
                e.currentTarget.style.borderColor = "#00FF99"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2C2C2C"
                e.currentTarget.style.borderColor = "#2C2C2C"
              }}
            >
              {question}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#2C2C2C" }}>
          <div className="flex-shrink-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#1A1F1C" }}
            >
              <div className="w-3 h-3 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI assistant anything..."
              className="min-h-[40px] resize-none border-0 bg-transparent p-0 focus:ring-0 focus:outline-none"
              style={{
                color: "#FFFFFF",
              }}
            />
          </div>

          <div className="flex-shrink-0">
            <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-transparent" style={{ color: "#B0B0B0" }}>
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-2 rounded-lg text-white disabled:opacity-50 hover:scale-105 transition-transform"
              style={{ backgroundColor: "#00FF99" }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#00D26A")}
              onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#00FF99")}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
