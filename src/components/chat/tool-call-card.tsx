"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Search,
  Calculator,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Timer,
} from "lucide-react"

export type ToolCallStatus = "running" | "success" | "error"

interface ToolCallCardProps {
  toolName: string
  args?: Record<string, unknown>
  result?: unknown
  status: ToolCallStatus
  durationMs?: number
  error?: string
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  web_search: <Search className="h-3.5 w-3.5" />,
  calculator: <Calculator className="h-3.5 w-3.5" />,
}

const TOOL_LABELS: Record<string, string> = {
  web_search: "Web Search",
  calculator: "Calculator",
}

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

function formatDuration(ms?: number): string {
  if (!ms) return ""
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function ToolCallCard({ toolName, args, result, status, durationMs, error }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(status === "error")

  const icon = TOOL_ICONS[toolName] || <Loader2 className="h-3.5 w-3.5" />
  const label = TOOL_LABELS[toolName] || toolName

  const statusConfig = {
    running: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      color: "border-blue-500/30 bg-blue-500/5",
      textColor: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    success: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
      textColor: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      color: "border-red-500/30 bg-red-500/5",
      textColor: "text-red-600 dark:text-red-400",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
  }[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn("my-2 overflow-hidden rounded-lg border text-sm", statusConfig.color)}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
      >
        <span className={statusConfig.textColor}>{statusConfig.icon}</span>
        <span className="flex h-5 w-5 items-center justify-center rounded bg-background/80 text-[11px] text-muted-foreground">
          {icon}
        </span>
        <span className="flex-1 text-xs font-medium">{label}</span>
        {durationMs && (
          <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", statusConfig.badge)}>
            <Timer className="h-3 w-3" />
            {formatDuration(durationMs)}
          </span>
        )}
        <span className="text-muted-foreground/50">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden border-t border-inherit"
          >
            <div className="space-y-2 p-3">
              {/* Args */}
              {args && Object.keys(args).length > 0 && (
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Input
                  </p>
                  <pre className="overflow-x-auto rounded bg-black/5 p-2 text-[11px] leading-relaxed dark:bg-white/5">
                    {formatJson(args)}
                  </pre>
                </div>
              )}

              {/* Result or Error */}
              {status === "error" && error ? (
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-red-500/60">
                    Error
                  </p>
                  <pre className="overflow-x-auto rounded bg-red-500/5 p-2 text-[11px] leading-relaxed text-red-600 dark:text-red-400">
                    {error}
                  </pre>
                </div>
              ) : result !== undefined && result !== null ? (
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Output
                  </p>
                  <pre className="overflow-x-auto rounded bg-black/5 p-2 text-[11px] leading-relaxed dark:bg-white/5">
                    {typeof result === "string" ? result : formatJson(result)}
                  </pre>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
