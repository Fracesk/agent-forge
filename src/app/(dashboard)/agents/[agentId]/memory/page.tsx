"use client"

import { useParams } from "next/navigation"
import { useAgent } from "@/hooks/use-agents"
import { MemoryList } from "@/components/agents/memory-list"
import { PageHeader } from "@/components/shared/page-header"
import { Brain, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AgentMemoryPage() {
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/agents/${agentId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {agent.name}
        </Link>
        <PageHeader
          title="Memory"
          description="View and manage what your agent remembers from past conversations"
        />
      </div>
      <MemoryList agentId={agentId} />
    </div>
  )
}
