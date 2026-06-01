import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Projector, Plus } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="项目"
        description="组织你的工作"
        actions={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建项目
          </Link>
        }
      />
      <EmptyState
        icon={Projector}
        title="还没有项目"
        description="创建项目来组织你的代理、对话和任务。"
        action={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            创建项目
          </Link>
        }
      />
    </div>
  )
}
