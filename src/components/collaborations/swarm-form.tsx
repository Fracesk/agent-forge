"use client"

import { useState } from "react"
import { useAgents } from "@/hooks/use-agents"
import { useCreateCollaboration } from "@/hooks/use-collaborations"
import { Loader2, Bot, Plus, X, ArrowRight, GitBranch } from "lucide-react"

export function SwarmForm() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const createCollaboration = useCreateCollaboration()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [task, setTask] = useState("")
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])

  const availableAgents = (agents || []).filter(
    (a: any) => !selectedAgents.includes(a.id)
  )

  const addAgent = (agentId: string) => {
    setSelectedAgents((prev) => [...prev, agentId])
  }

  const removeAgent = (agentId: string) => {
    setSelectedAgents((prev) => prev.filter((id) => id !== agentId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedAgents.length === 0) return

    createCollaboration.mutate({
      name,
      description,
      agentIds: selectedAgents,
      strategy: "sequential",
      config: { task },
    })
  }

  const selectedAgentDetails = (agents || []).filter((a: any) =>
    selectedAgents.includes(a.id)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">基本信息</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              协作名称
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：研究报告写作团队"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="desc" className="mb-1.5 block text-sm font-medium">
              描述（可选）
            </label>
            <input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="这个协作的目的是什么？"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Task */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">任务描述</h2>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          rows={4}
          placeholder="描述你想要完成的任务，例如：写一篇关于 AI Agent 发展趋势的文章"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
        />
      </div>

      {/* Agent selection */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">选择代理（按顺序）</h2>

        {/* Selected agents */}
        {selectedAgentDetails.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-muted-foreground">已选择的代理：</p>
            {selectedAgentDetails.map((agent: any, i: number) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                  {i + 1}
                </span>
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{agent.name}</span>
                <span className="text-[10px] text-muted-foreground">{agent.model}</span>
                <button
                  type="button"
                  onClick={() => removeAgent(agent.id)}
                  className="rounded p-1 text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available agents */}
        {agentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : availableAgents.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {availableAgents.map((agent: any) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => addAgent(agent.id)}
                className="flex items-center gap-3 rounded-lg border border-input p-3 text-left transition-colors hover:bg-accent"
              >
                <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{agent.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {agent.model}
                  </p>
                </div>
                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            没有更多可选代理了
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!name.trim() || selectedAgents.length === 0 || createCollaboration.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {createCollaboration.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <GitBranch className="h-4 w-4" />
            创建协作
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
