"use client"

import { useChatStream } from "@/hooks/use-chat-stream"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { Bot, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SimpleMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
}

interface ChatWindowProps {
  agentId: string
  agentName: string
  agentModel?: string
  initialMessages?: SimpleMessage[]
  conversationId?: string
  standalone?: boolean
}

export function ChatWindow({
  agentId,
  agentName,
  agentModel,
  initialMessages = [],
  conversationId: initialConversationId,
  standalone,
}: ChatWindowProps) {
  const {
    messages,
    toolCalls,
    sendMessage,
    isLoading,
    stop,
  } = useChatStream({
    agentId,
    conversationId: initialConversationId,
    initialMessages,
    onFinish: () => {
      window.dispatchEvent(new Event("conversation-updated"))
    },
  })

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Agent header */}
      {standalone && (
        <div className="flex items-center gap-3 border-b bg-background/50 backdrop-blur-sm px-4 py-3 shrink-0">
          <Link
            href={`/agents/${agentId}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{agentName}</h2>
            {agentModel && (
              <p className="text-[10px] text-muted-foreground">{agentModel}</p>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        agentName={agentName}
        toolCalls={toolCalls}
        onSendSuggestion={sendMessage}
      />

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={stop}
      />
    </div>
  )
}
