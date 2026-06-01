"use client"

import { PageHeader } from "@/components/shared/page-header"
import { AgentForm } from "@/components/agents/agent-form"

export default function NewAgentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create Agent"
        description="Configure a new AI agent with custom system prompt, model, and tools"
      />
      <AgentForm mode="create" />
    </div>
  )
}
