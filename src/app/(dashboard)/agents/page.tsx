"use client"

import { useAgents } from "@/hooks/use-agents"
import { AgentCard } from "@/components/agents/agent-card"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { motion } from "framer-motion"
import { Bot, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
}

export default function AgentsPage() {
  const { data: agents, isLoading, error } = useAgents()

  return (
    <div>
      <PageHeader
        title="代理"
        description="创建和管理你的 AI 代理"
        actions={
          <Link
            href="/agents/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建代理
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">加载代理失败，请重试。</p>
        </div>
      ) : agents?.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="还没有代理"
          description="创建你的第一个 AI 代理来开始吧。你可以为代理配置自定义系统提示词、工具和模型参数。"
          action={
            <Link
              href="/agents/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              创建代理
            </Link>
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {agents?.map((agent: any) => (
            <motion.div key={agent.id} variants={itemVariants}>
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
