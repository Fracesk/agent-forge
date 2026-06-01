import { PageHeader } from "@/components/shared/page-header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Projector } from "lucide-react"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <div>
      <PageHeader title={`Project ${projectId}`} />
      <ComingSoon
        title="Project Details"
        description="The project detail view is under development. It will include task boards, agent collaboration, and progress tracking."
        icon={<Projector className="h-7 w-7" />}
        features={["Kanban task board", "Timeline view", "Agent activity log", "File attachments"]}
      />
    </div>
  )
}
