"use client"

import { useConversations, useDeleteConversation } from "@/hooks/use-conversations"
import { useRouter } from "next/navigation"
import { cn, formatDate, truncate } from "@/lib/utils"
import { MessageSquare, Trash2, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface ConversationListProps {
  activeId?: string
  agentId?: string
}

export function ConversationList({ activeId, agentId }: ConversationListProps) {
  const router = useRouter()
  const { data: conversations, isLoading, refetch } = useConversations()
  const deleteConversation = useDeleteConversation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Refresh on conversation update events
  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener("conversation-updated", handler)
    return () => window.removeEventListener("conversation-updated", handler)
  }, [refetch])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    await deleteConversation.mutateAsync(id)
    setDeletingId(null)
  }

  const filteredConversations = agentId
    ? conversations?.filter((c: any) => c.agents?.some((a: any) => a.id === agentId))
    : conversations

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <button
          onClick={() => router.push("/conversations")}
          className="rounded-lg p-1 hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations?.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {filteredConversations?.map((conv: any) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/conversations/${conv.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/conversations/${conv.id}`) }}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                  activeId === conv.id && "bg-accent font-medium"
                )}
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate">{conv.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{conv._count?.messages || 0} messages</span>
                    <span>·</span>
                    <span>{formatDate(conv.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(e, conv.id) }}
                  className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                >
                  {deletingId === conv.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
