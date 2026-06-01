"use client"

import { useParams } from "next/navigation"
import { SwarmVisualization } from "@/components/collaborations/swarm-visualization"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CollaborationDetailPage() {
  const params = useParams()
  const collaborationId = params.collaborationId as string

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <Link
          href="/collaborations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回协作列表
        </Link>
      </div>
      <SwarmVisualization collaborationId={collaborationId} />
    </div>
  )
}
