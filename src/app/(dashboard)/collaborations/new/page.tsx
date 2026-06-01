"use client"

import { PageHeader } from "@/components/shared/page-header"
import { SwarmForm } from "@/components/collaborations/swarm-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCollaborationPage() {
  return (
    <div>
      <div className="mb-2">
        <Link
          href="/collaborations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回协作列表
        </Link>
      </div>
      <PageHeader
        title="创建协作"
        description="选择多个代理，按顺序协作完成任务"
      />
      <div className="mx-auto max-w-2xl">
        <SwarmForm />
      </div>
    </div>
  )
}
