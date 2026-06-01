"use client"

import { useState } from "react"
import { useCreateAgent, useUpdateAgent, useTools } from "@/hooks/use-agents"
import { SUPPORTED_PROVIDERS } from "@/lib/ai"
import { Loader2, Bot, Save } from "lucide-react"

interface AgentFormProps {
  initialData?: {
    id: string
    name: string
    description?: string | null
    systemPrompt: string
    model: string
    temperature: number
    maxTokens: number
    toolIds?: string[]
  }
  mode: "create" | "edit"
}

export function AgentForm({ initialData, mode }: AgentFormProps) {
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent(initialData?.id || "")
  const { data: availableTools } = useTools()

  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || "You are a helpful AI assistant."
  )
  const [selectedProvider, setSelectedProvider] = useState(
    initialData?.model?.split(":")[0] || SUPPORTED_PROVIDERS[0].value
  )
  const [selectedModel, setSelectedModel] = useState(
    initialData?.model?.split(":")[1] || SUPPORTED_PROVIDERS[0].models[0]
  )
  const [temperature, setTemperature] = useState(initialData?.temperature ?? 0.7)
  const [maxTokens, setMaxTokens] = useState(initialData?.maxTokens ?? 4096)
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.toolIds || [])
  const [saving, setSaving] = useState(false)

  const currentProvider = SUPPORTED_PROVIDERS.find((p) => p.value === selectedProvider)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const modelString = `${selectedProvider}:${selectedModel}`
    const data = {
      name,
      description: description || undefined,
      systemPrompt,
      model: modelString,
      temperature,
      maxTokens,
      toolIds: selectedTools,
    }

    try {
      if (mode === "create") {
        await createAgent.mutateAsync(data)
      } else {
        await updateAgent.mutateAsync(data)
      }
    } catch (error) {
      console.error("Failed to save agent:", error)
    } finally {
      setSaving(false)
    }
  }

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">基本信息</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              代理名称
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：研究助手"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              描述（可选）
            </label>
            <input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="这个代理是做什么的？"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* System Prompt */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-semibold">系统提示词</h2>
          <p className="text-sm text-muted-foreground">
            定义代理的个性、行为和知识
          </p>
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
      </div>

      {/* Model Configuration */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-semibold">模型配置</h2>
          <p className="text-sm text-muted-foreground">
            选择 AI 模型并调整参数
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">供应商</label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value)
                const provider = SUPPORTED_PROVIDERS.find((p) => p.value === e.target.value)
                if (provider) setSelectedModel(provider.models[0])
              }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {SUPPORTED_PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {currentProvider?.models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>精确</span>
              <span>创意</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">最大 Token 数</label>
            <select
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {[2048, 4096, 8192, 16384, 32768].map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools */}
      {availableTools && availableTools.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4">
            <h2 className="font-semibold">工具</h2>
            <p className="text-sm text-muted-foreground">
              为代理启用工具
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {availableTools.map((tool: any) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => toggleTool(tool.id)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selectedTools.includes(tool.id)
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-accent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool.id)}
                  onChange={() => toggleTool(tool.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving || !name || !systemPrompt}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === "create" ? "Create Agent" : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
