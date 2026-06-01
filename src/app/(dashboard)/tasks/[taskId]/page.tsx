import { PageHeader } from "@/components/shared/page-header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { CheckSquare } from "lucide-react"

export default function TaskDetailPage() {
  return (
    <div>
      <PageHeader title="Task Details" />
      <ComingSoon
        title="Task Details"
        description="The task detail view is coming soon. It will show task status, dependencies, and execution history."
        icon={<CheckSquare className="h-7 w-7" />}
        features={["Task status updates", "Dependency graph", "Execution logs", "Assignment management"]}
      />
    </div>
  )
}
