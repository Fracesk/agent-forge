"use client"

import { useState } from "react"
import { cn, formatDate } from "@/lib/utils"
import { Brain, Trash2, ChevronDown, ChevronRight, Copy, Check } from "lucide-react"
// Import directly from types.ts to avoid pulling server-side modules into the client bundle
const MEMORY_TYPE_LABELS: Record<string, string> = {
  episodic: "情景记忆",
  semantic: "语义记忆",
  procedural: "程序记忆",
}
const MEMORY_TYPE_COLORS: Record<string, string> = {
  episodic: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  semantic: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  procedural: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}
import type { AgentMemory } from "@/hooks/use-agent-memory"

interface MemoryCardProps {
  memory: AgentMemory
  onDelete: (id: string) => void
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const typeLabel = MEMORY_TYPE_LABELS[memory.type as keyof typeof MEMORY_TYPE_LABELS] || memory.type
  const typeColor = MEMORY_TYPE_COLORS[memory.type as keyof typeof MEMORY_TYPE_COLORS] || "bg-gray-500/10 text-gray-600"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(memory.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    onDelete(memory.id)
  }

  const isLong = memory.content.length > 300

  return (
    <div className="group rounded-lg border bg-card transition-colors hover:border-muted-foreground/20">
      <div className="p-4">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", typeColor)}>
            <Brain className="h-3 w-3" />
            {typeLabel}
          </span>
          <span className="text-[11px] text-muted-foreground/60">
            {formatDate(memory.createdAt)}
          </span>
          <div className="ml-auto flex items-center gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="rounded p-1 text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent"
              title="复制"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded p-1 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
              title="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed text-foreground/90">
          {isLong && !expanded ? (
            <>
              <p>{memory.content.slice(0, 300)}...</p>
              <button
                onClick={() => setExpanded(true)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ChevronRight className="h-3 w-3" />
                Show more
              </button>
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{memory.content}</p>
              {isLong && (
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ChevronDown className="h-3 w-3" />
                  Show less
                </button>
              )}
            </>
          )}
        </div>

        {/* Importance bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                memory.importance > 0.6
                  ? "bg-emerald-500"
                  : memory.importance > 0.3
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30"
              )}
              style={{ width: `${memory.importance * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground/50">
            {(memory.importance * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )
}
