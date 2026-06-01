"use client"

import { useAgent, useDeleteAgent } from "@/hooks/use-agents"
import { PageHeader } from "@/components/shared/page-header"
import { AgentForm } from "@/components/agents/agent-form"
import { Loader2, ArrowLeft, Trash2, MessageSquare, Brain } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const { data: agent, isLoading, error } = useAgent(agentId)
  const deleteAgent = useDeleteAgent()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="py-20 text-center">
        <p className="text-destructive">Agent not found</p>
        <Link href="/agents" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteAgent.mutateAsync(agentId)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={agent.name}
        description={agent.description || "Edit agent configuration"}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/agents/${agentId}/chat`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Link>
            <Link
              href={`/agents/${agentId}/memory`}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <Brain className="h-4 w-4" />
              Memory
            </Link>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        }
      />

      <AgentForm
        mode="edit"
        initialData={{
          id: agent.id,
          name: agent.name,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          model: agent.model,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          toolIds: agent.tools?.map((t: any) => t.toolId),
        }}
      />
    </div>
  )
}
