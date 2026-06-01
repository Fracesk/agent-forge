"use client"

import { useAgent } from "@/hooks/use-agents"
import { ChatWindow } from "@/components/chat/chat-window"
import { ConversationList } from "@/components/chat/conversation-list"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function AgentChatPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const { data: agent, isLoading } = useAgent(agentId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Agent not found</p>
        <Link
          href="/agents"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] -mx-6 -mb-6">
      {/* Conversation sidebar */}
      <div className="hidden w-72 shrink-0 border-r lg:block">
        <ConversationList agentId={agentId} />
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/agents/${agentId}`}
              className="rounded-lg p-1 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h2 className="text-sm font-semibold">{agent.name}</h2>
              <p className="text-xs text-muted-foreground">
                {agent.model?.split(":")[1] || agent.model}
              </p>
            </div>
          </div>
        </div>

        <ChatWindow
          agentId={agentId}
          agentName={agent.name}
        />
      </div>
    </div>
  )
}
