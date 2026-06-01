"use client"

import { useCollaborations } from "@/hooks/use-collaborations"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { GitBranch, Plus, Loader2, Bot, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "活跃", color: "bg-muted text-muted-foreground" },
  running: { label: "运行中", color: "bg-blue-500/10 text-blue-600" },
  completed: { label: "已完成", color: "bg-emerald-500/10 text-emerald-600" },
  failed: { label: "失败", color: "bg-red-500/10 text-red-600" },
}

export default function CollaborationsPage() {
  const router = useRouter()
  const { data: collaborations, isLoading } = useCollaborations()

  return (
    <div>
      <PageHeader
        title="协作"
        description="多代理协同会话"
        actions={
          <Link
            href="/collaborations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新建协作
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !collaborations || collaborations.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="还没有协作"
          description="创建多代理协同，让你的代理协作完成复杂任务。"
          action={
            <Link
              href="/collaborations/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              创建协作
            </Link>
          }
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {collaborations.map((collab: any) => {
            const statusInfo = STATUS_LABELS[collab.status] || STATUS_LABELS.active
            return (
              <motion.div key={collab.id} variants={itemVariants}>
                <button
                  onClick={() => router.push(`/collaborations/${collab.id}`)}
                  className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold truncate">{collab.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{collab._count?.agents || collab.agents?.length || 0} 个代理</span>
                      <span>·</span>
                      <span>策略：{collab.strategy === "sequential" ? "顺序执行" : collab.strategy}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
