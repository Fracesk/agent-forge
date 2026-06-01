"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChatMessage, type ToolCallDisplay } from "./chat-message"
import { Sparkles, MessageSquare, Code, Brain, Loader2 } from "lucide-react"

const SUGGESTIONS = [
  { icon: MessageSquare, label: "帮我调试", text: "帮我调试这个错误：TypeError: Cannot read properties of undefined" },
  { icon: Code, label: "写代码", text: "写一个 React 自定义 Hook，实现带类型安全的 localStorage 存取" },
  { icon: Brain, label: "解释概念", text: "解释向量嵌入 (Vector Embeddings) 的工作原理及其在语义搜索中的应用" },
  { icon: Sparkles, label: "总结对比", text: "总结 REST 和 GraphQL API 的关键区别及各自的适用场景" },
]

interface SimpleMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
}

interface ChatMessagesProps {
  messages: SimpleMessage[]
  isLoading: boolean
  agentName?: string
  toolCalls?: ToolCallDisplay[]
  onSendSuggestion?: (text: string) => void
}

export function ChatMessages({ messages, isLoading, agentName, toolCalls, onSendSuggestion }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {agentName ? `与 ${agentName} 对话` : "开始对话"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              发送消息或选择下方的建议开始。
            </p>
          </motion.div>

          {/* Suggestion cards */}
          <div className="grid gap-2.5">
            {SUGGESTIONS.map((suggestion, i) => {
              const Icon = suggestion.icon
              return (
                <motion.button
                  key={suggestion.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                  onClick={() => onSendSuggestion?.(suggestion.text)}
                  className="group flex items-center gap-3 rounded-xl border bg-card p-3.5 text-left transition-all hover:bg-accent/50 hover:border-primary/20 hover:shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium">{suggestion.label}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {suggestion.text}
                    </p>
                  </div>
                  <span className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto">
      {messages.map((message, index) => {
        // Only pass toolCalls to the last assistant message (the one being streamed)
        const isLastAssistant = index === messages.length - 1 && message.role === "assistant" && toolCalls && toolCalls.length > 0
        return (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChatMessage
              role={message.role}
              content={message.content}
              agentName={message.role === "assistant" ? agentName : undefined}
              isStreaming={index === messages.length - 1 && isLoading}
              toolCalls={isLastAssistant ? toolCalls : undefined}
            />
          </motion.div>
        )
      })}

      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
