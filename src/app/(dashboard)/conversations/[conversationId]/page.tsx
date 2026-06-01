"use client"

import { useConversation, useConversationMessages } from "@/hooks/use-conversations"
import { ChatWindow } from "@/components/chat/chat-window"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ConversationDetailPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const { data: conversation, isLoading: convLoading } = useConversation(conversationId)
  const { data: messages, isLoading: messagesLoading } = useConversationMessages(conversationId)

  // Get agent info from the conversation relation instead of scanning messages
  const agentId = conversation?.agents?.[0]?.id || ""
  const agentName = conversation?.agents?.[0]?.name || "AI Agent"

  if (convLoading || messagesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] -mx-6 -mb-6">
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <Link
            href="/conversations"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回对话列表
          </Link>
        </div>

        {agentId ? (
          <ChatWindow
            agentId={agentId}
            agentName={agentName}
            initialMessages={messages?.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
            })) || []}
            conversationId={conversationId}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            未找到此对话的代理
          </div>
        )}
      </div>
    </div>
  )
}
