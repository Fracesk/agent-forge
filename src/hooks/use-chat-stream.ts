"use client"

import { useState, useRef, useCallback } from "react"
import type { ToolCallStatus } from "@/components/chat/tool-call-card"

export interface SimpleMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
}

export interface ToolCallState {
  id: string
  toolName: string
  args?: Record<string, unknown>
  result?: unknown
  status: ToolCallStatus
  durationMs?: number
  error?: string
}

interface UseChatStreamOptions {
  agentId: string
  conversationId?: string
  initialMessages?: SimpleMessage[]
  onFinish?: () => void
}

export function useChatStream({
  agentId,
  conversationId,
  initialMessages = [],
  onFinish,
}: UseChatStreamOptions) {
  const [messages, setMessages] = useState<SimpleMessage[]>(initialMessages)
  const [toolCalls, setToolCalls] = useState<ToolCallState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()
  const abortRef = useRef<AbortController | null>(null)
  // Use a ref to always have the latest messages available in callbacks,
  // avoiding stale closure issues from the `messages` dependency.
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Add user message
    const userMessage: SimpleMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setToolCalls([]) // Reset tool calls for new message
    setIsLoading(true)
    setError(undefined)

    // Create assistant message placeholder
    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: SimpleMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const abortController = new AbortController()
      abortRef.current = abortController

      // Read current messages from ref to avoid stale closure
      const currentMessages = messagesRef.current

      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          conversationId,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)

              switch (parsed.type) {
                case "text":
                  if (parsed.delta) {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantId
                          ? { ...msg, content: msg.content + parsed.delta }
                          : msg
                      )
                    )
                  }
                  break

                case "tool_start":
                  setToolCalls((prev) => [
                    ...prev,
                    {
                      id: parsed.toolCallId,
                      toolName: parsed.toolName,
                      args: parsed.args,
                      status: "running",
                    },
                  ])
                  break

                case "tool_end":
                  setToolCalls((prev) =>
                    prev.map((tc) =>
                      tc.id === parsed.toolCallId
                        ? {
                            ...tc,
                            status: "success",
                            result: parsed.result,
                            durationMs: parsed.duration,
                          }
                        : tc
                    )
                  )
                  break

                case "tool_error":
                  setToolCalls((prev) =>
                    prev.map((tc) =>
                      tc.id === parsed.toolCallId
                        ? {
                            ...tc,
                            status: "error",
                            error: parsed.error,
                            durationMs: parsed.duration,
                          }
                        : tc
                    )
                  )
                  break
              }
            } catch {
              // Skip unparseable chunks
            }
          }
        }
      }

      onFinish?.()
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err)
        // Remove the empty assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId))
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [agentId, conversationId, isLoading, onFinish]) // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setToolCalls([])
    setError(undefined)
  }, [])

  return {
    messages,
    toolCalls,
    sendMessage,
    isLoading,
    stop,
    error,
    clearMessages,
  }
}
