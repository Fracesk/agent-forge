"use client"

import Link from "next/link"
import { Bot, MessageSquare, Brain, Sparkles, MoreHorizontal, Trash2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeleteAgent } from "@/hooks/use-agents"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description?: string | null
    model: string
    status: string
    _count?: {
      conversations: number
      memories: number
    }
  }
}

const statusConfig: Record<string, { color: string; label: string }> = {
  idle: { color: "bg-emerald-500", label: "Ready" },
  busy: { color: "bg-amber-500", label: "Busy" },
  error: { color: "bg-red-500", label: "Error" },
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter()
  const deleteAgent = useDeleteAgent()
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const status = statusConfig[agent.status] || statusConfig.idle
  const modelDisplay = agent.model.includes(":") ? agent.model.split(":")[1] : agent.model

  const handleDelete = async () => {
    await deleteAgent.mutateAsync(agent.id)
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false) }}
    >
      {/* Gradient hover effect */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500",
          isHovered && "opacity-100"
        )}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <Link href={`/agents/${agent.id}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
                <Bot className="h-5.5 w-5.5 text-primary" />
              </div>
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-background",
                  status.color
                )}
              >
                <span className={cn("absolute inset-0 rounded-full animate-ping opacity-30", status.color)} />
              </span>
            </div>
            <div>
              <h3 className="font-semibold leading-none tracking-tight">{agent.name}</h3>
              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {modelDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed">
            {agent.description}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          {agent._count && (
            <>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{agent._count.conversations} chats</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" />
                <span>{agent._count.memories || 0} memories</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className={cn("capitalize", status.color.replace("bg-", "text-"))}>{status.label}</span>
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Actions overlay */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
        <button
          onClick={() => router.push(`/agents/${agent.id}/chat`)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105"
          title="Chat"
        >
          <Play className="h-3.5 w-3.5 ml-0.5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm border hover:bg-accent transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border bg-popover p-1 shadow-xl animate-in fade-in zoom-in-95">
                {confirmDelete ? (
                  <div className="space-y-1 p-1">
                    <p className="px-2 py-1 text-xs text-muted-foreground">Are you sure?</p>
                    <button
                      onClick={() => { handleDelete(); setConfirmDelete(false) }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Agent
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
