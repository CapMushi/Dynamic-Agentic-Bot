"use client"

import { useState } from "react"
import { Plus, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Persona, LLMProvider } from "@/lib/types"

interface PersonaManagementPanelProps {
  personas: Persona[]
  llmProviders: LLMProvider[]
  onPersonaToggle: (personaId: string) => void
  onProviderAdd: (provider: Omit<LLMProvider, 'id'>) => void
  onProviderUpdate: (id: string, updates: Partial<LLMProvider>) => void
  onProviderDelete: (id: string) => void
}

export function PersonaManagementPanel({
  personas,
  llmProviders,
  onPersonaToggle,
  onProviderAdd,
  onProviderUpdate,
  onProviderDelete
}: PersonaManagementPanelProps) {
  const [showAddPersona, setShowAddPersona] = useState(false)
  const [newPersonaName, setNewPersonaName] = useState("")
  const [newPersonaApiKey, setNewPersonaApiKey] = useState("")
  const [newPersonaProvider, setNewPersonaProvider] = useState("")




  const handleAddPersona = () => {
    if (!newPersonaName || !newPersonaProvider) return

    // First add the provider if it doesn't exist
    const existingProvider = llmProviders.find(p => p.name === newPersonaProvider)
    if (!existingProvider && newPersonaApiKey) {
      onProviderAdd({
        name: newPersonaProvider,
        apiKey: newPersonaApiKey,
        models: getDefaultModels(newPersonaProvider),
        status: 'disconnected'
      })
    }

    // Note: In a real implementation, you'd also add the persona
    // For now, we just reset the form
    setNewPersonaName("")
    setNewPersonaApiKey("")
    setNewPersonaProvider("")
    setShowAddPersona(false)
  }



  const getDefaultModels = (providerName: string): string[] => {
    const modelMap: Record<string, string[]> = {
      'OpenAI': ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      'Claude': ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
      'DeepSeek': ['deepseek-coder', 'deepseek-chat', 'deepseek-reasoner']
    }
    return modelMap[providerName] || []
  }

  return (
    <div className="space-y-4">
      {/* AI Personas Section */}
      <Card style={{ backgroundColor: "#1A1F1C", borderColor: "#2C2C2C" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: "#FFFFFF" }}>
            <Bot className="h-5 w-5" />
            AI Personas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {personas.map((persona, idx) => (
            <div
              key={persona.id || idx}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#2C2C2C", border: "1px solid #2C2C2C" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: persona.active ? "#00FF99" : "#444444" }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                    {persona.name}
                  </p>
                  <p className="text-xs" style={{ color: "#B0B0B0" }}>
                    {persona.provider}
                  </p>
                </div>
              </div>
              <Switch
                checked={persona.active}
                onCheckedChange={() => onPersonaToggle(persona.id)}
                style={{
                  backgroundColor: persona.active ? "#00FF99" : "#444444",
                }}
              />
            </div>
          ))}

          {!showAddPersona ? (
            <div key="add-persona-button">
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:text-white transition-colors bg-transparent"
                style={{
                  backgroundColor: "#2C2C2C",
                  borderColor: "#2C2C2C",
                  color: "#B0B0B0",
                }}
                onClick={() => setShowAddPersona(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#00FF99"
                  e.currentTarget.style.borderColor = "#00FF99"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2C2C2C"
                  e.currentTarget.style.borderColor = "#2C2C2C"
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Persona
              </Button>
            </div>
          ) : (
            <div key="add-persona-form" className="space-y-3 p-3 rounded-lg" style={{ backgroundColor: "#1A1F1C" }}>
              <div>
                <Label htmlFor="persona-name" className="text-sm" style={{ color: "#B0B0B0" }}>
                  Persona Name
                </Label>
                <Input
                  id="persona-name"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="e.g., Marketing Expert"
                  style={{
                    backgroundColor: "#2C2C2C",
                    borderColor: "#2C2C2C",
                    color: "#FFFFFF",
                  }}
                  className="placeholder:text-gray-400 focus:border-[#00FF99] focus:ring-[#00FF99]"
                />
              </div>
              
              <div>
                <Label htmlFor="provider-select" className="text-sm" style={{ color: "#B0B0B0" }}>
                  LLM Provider
                </Label>
                <Select value={newPersonaProvider} onValueChange={setNewPersonaProvider}>
                  <SelectTrigger style={{ backgroundColor: "#2C2C2C", borderColor: "#2C2C2C" }}>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "#1A1F1C", borderColor: "#444444" }}>
                    <SelectItem key="openai" value="OpenAI">OpenAI</SelectItem>
                    <SelectItem key="claude" value="Claude">Claude</SelectItem>
                    <SelectItem key="deepseek" value="DeepSeek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="api-key" className="text-sm" style={{ color: "#B0B0B0" }}>
                  API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newPersonaApiKey}
                  onChange={(e) => setNewPersonaApiKey(e.target.value)}
                  placeholder="Enter API key"
                  style={{
                    backgroundColor: "#2C2C2C",
                    borderColor: "#2C2C2C",
                    color: "#FFFFFF",
                  }}
                  className="placeholder:text-gray-400 focus:border-[#00FF99] focus:ring-[#00FF99]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-white"
                  onClick={handleAddPersona}
                  disabled={!newPersonaName || !newPersonaProvider}
                  style={{ backgroundColor: "#00FF99" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00D26A")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#00FF99")}
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "#2C2C2C",
                    color: "#B0B0B0",
                  }}
                  onClick={() => setShowAddPersona(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 