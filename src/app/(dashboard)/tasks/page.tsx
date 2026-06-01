import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CheckSquare } from "lucide-react"

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="任务"
        description="管理和追踪任务"
      />
      <EmptyState
        icon={CheckSquare}
        title="还没有任务"
        description="当你创建任务或代理生成任务时，它们会显示在这里。"
      />
    </div>
  )
}
