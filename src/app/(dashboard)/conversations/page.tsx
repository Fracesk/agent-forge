"use client"

import { useConversations } from "@/hooks/use-conversations"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { motion } from "framer-motion"
import { MessageSquare, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
}

export default function ConversationsPage() {
  const router = useRouter()
  const { data: conversations, isLoading } = useConversations()

  return (
    <div>
      <PageHeader
        title="对话"
        description="与 AI 代理的聊天历史"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : conversations?.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="还没有对话"
          description="与一个代理开始聊天，你的对话历史会显示在这里。"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {conversations?.map((conv: any) => (
            <motion.div key={conv.id} variants={itemVariants}>
              <button
                onClick={() => router.push(`/conversations/${conv.id}`)}
                className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold truncate">{conv.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {conv.agents?.[0] && (
                      <span>与 {conv.agents[0].name} 的对话</span>
                    )}
                    <span>·</span>
                    <span>{conv._count?.messages || 0} 条消息</span>
                    <span>·</span>
                    <span>{formatDate(conv.updatedAt)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {conv.messages?.[0]?.content
                    ? `${conv.messages[0].content.slice(0, 80)}...`
                    : "No messages yet"}
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
