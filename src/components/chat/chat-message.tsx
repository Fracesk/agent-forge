"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, User, Copy, Check } from "lucide-react"
import { useState } from "react"
import { ToolCallCard, type ToolCallStatus } from "./tool-call-card"

export interface ToolCallDisplay {
  toolName: string
  args?: Record<string, unknown>
  result?: unknown
  status: ToolCallStatus
  durationMs?: number
  error?: string
}

interface ChatMessageProps {
  role: "user" | "assistant" | "system" | "tool"
  content: string
  agentName?: string
  isStreaming?: boolean
  toolCalls?: ToolCallDisplay[]
}

export function ChatMessage({ role, content, agentName, isStreaming, toolCalls }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!content && !isStreaming && (!toolCalls || toolCalls.length === 0)) return null

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex w-full max-w-3xl gap-4 px-4 py-5", isUser && "flex-row-reverse")}>
        {/* Avatar */}
        <div className="flex shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-sm">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10 shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn("flex min-w-0 flex-1 flex-col", isUser && "items-end")}>
          {!isUser && agentName && (
            <span className="mb-1.5 text-xs font-medium text-muted-foreground/70">
              {agentName}
            </span>
          )}

          <div
            className={cn(
              "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-sm"
                : "bg-muted/40 border"
            )}
          >
            {/* Tool calls */}
            {!isUser && toolCalls && toolCalls.length > 0 && (
              <div className={cn(content && "mb-3")}>
                {toolCalls.map((tc) => (
                  <ToolCallCard
                    key={`${tc.toolName}-${tc.status}-${tc.durationMs || 0}`}
                    toolName={tc.toolName}
                    args={tc.args}
                    result={tc.result}
                    status={tc.status}
                    durationMs={tc.durationMs}
                    error={tc.error}
                  />
                ))}
              </div>
            )}
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-pre:bg-muted/80 prose-pre:border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-flex h-5 w-2 animate-pulse rounded-sm bg-primary ml-0.5 align-text-bottom" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isUser && content && !isStreaming && (
            <div className="mt-1 flex items-center gap-1 px-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
