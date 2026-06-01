"use client"

import { useParams } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Sliders } from "lucide-react"

export default function AgentSettingsPage() {
  const params = useParams()
  const agentId = params.agentId as string

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Agent Settings"
        description={`Advanced settings for ${agentId}`}
      />
      <ComingSoon
        title="Advanced Settings"
        description="Agent-level settings are under development. You'll be able to configure custom parameters, rate limits, and security controls."
        icon={<Sliders className="h-7 w-7" />}
        features={["Custom parameters", "Rate limiting", "Access control", "Audit logging"]}
      />
    </div>
  )
}
