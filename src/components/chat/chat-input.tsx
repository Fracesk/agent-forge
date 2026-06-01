"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { SendHorizonal, Square, Sparkles } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  onStop?: () => void
  placeholder?: string
}

export function ChatInput({ onSend, isLoading, onStop, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <div className="border-t bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="relative flex items-end gap-2 rounded-2xl border bg-background shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/30">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              handleInput()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "发送消息给代理..."}
            rows={1}
            className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60"
            disabled={isLoading}
          />

          {isLoading && onStop ? (
            <button
              onClick={onStop}
              className="mr-1.5 mb-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95"
              title="停止生成"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="mr-1.5 mb-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary transition-all active:scale-95"
              title="发送消息"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
          AI 可能会犯错，请核实重要信息。
        </p>
      </div>
    </div>
  )
}
