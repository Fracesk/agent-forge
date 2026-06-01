"use client"

import { useCollaboration, useRunCollaboration } from "@/hooks/use-collaborations"
import { Loader2, Bot, CheckCircle2, XCircle, Clock, Play, ArrowDown, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface SwarmVisualizationProps {
  collaborationId: string
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-muted-foreground",
    label: "等待中",
  },
  running: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-blue-500",
    label: "运行中",
  },
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-500",
    label: "已完成",
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-500",
    label: "失败",
  },
}

export function SwarmVisualization({ collaborationId }: SwarmVisualizationProps) {
  const { data: collab, isLoading, error, refetch } = useCollaboration(collaborationId)
  const runMutation = useRunCollaboration()

  const handleRun = async () => {
    try {
      await runMutation.mutateAsync(collaborationId)
      toast.success("协作执行完成！")
      refetch()
    } catch (err: any) {
      toast.error(err.message || "执行失败")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !collab) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
        加载协作失败
      </div>
    )
  }

  const canRun = collab.status === "active" || collab.status === "failed"
  const agents = collab.agents || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{collab.name}</h2>
          {collab.description && (
            <p className="mt-1 text-sm text-muted-foreground">{collab.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            collab.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
            collab.status === "failed" ? "bg-red-500/10 text-red-600" :
            collab.status === "running" ? "bg-blue-500/10 text-blue-600" :
            "bg-muted text-muted-foreground"
          }`}>
            {STATUS_CONFIG[collab.status]?.icon}
            {STATUS_CONFIG[collab.status]?.label || collab.status}
          </span>
          {canRun && (
            <button
              onClick={handleRun}
              disabled={runMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {runMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              执行协作
            </button>
          )}
        </div>
      </div>

      {/* Strategy badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        策略：{collab.strategy === "sequential" ? "顺序执行" : collab.strategy}
        {collab.maxRounds && <span>· 最大轮次：{collab.maxRounds}</span>}
      </div>

      {/* Agent pipeline visualization */}
      <div className="relative">
        {agents.map((agent: any, i: number) => {
          const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.pending
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              {/* Connector line */}
              {i > 0 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}

              {/* Agent card */}
              <div className={`rounded-xl border p-4 transition-colors ${
                agent.status === "running" ? "border-blue-500/30 bg-blue-500/5" :
                agent.status === "completed" ? "border-emerald-500/20 bg-emerald-500/3" :
                agent.status === "failed" ? "border-red-500/20 bg-red-500/3" :
                "bg-card"
              }`}>
                <div className="flex items-center gap-3">
                  {/* Order number */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>

                  {/* Agent info */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{agent.agent?.name || "Unknown Agent"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {agent.role || agent.agent?.model || "No role set"}
                    </p>
                  </div>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Input/Output */}
                {(agent.input || agent.output) && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {agent.input && (
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                          输入
                        </p>
                        <pre className="overflow-x-auto rounded bg-muted/50 p-2 text-[11px] leading-relaxed">
                          {agent.input.length > 200
                            ? `${agent.input.slice(0, 200)}...`
                            : agent.input}
                        </pre>
                      </div>
                    )}
                    {agent.output && (
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                          输出
                        </p>
                        <pre className="overflow-x-auto rounded bg-muted/50 p-2 text-[11px] leading-relaxed">
                          {agent.output.length > 300
                            ? `${agent.output.slice(0, 300)}...`
                            : agent.output}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Final result */}
      {collab.result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6"
        >
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            最终结果
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {typeof collab.result === "string"
                ? collab.result
                : JSON.stringify(collab.result, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {collab.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            {collab.error}
          </p>
        </div>
      )}
    </div>
  )
}
