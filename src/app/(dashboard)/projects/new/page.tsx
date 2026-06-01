import { PageHeader } from "@/components/shared/page-header"
import { ComingSoon } from "@/components/shared/coming-soon"
import { Rocket } from "lucide-react"

export default function NewProjectPage() {
  return (
    <div>
      <PageHeader title="Create Project" />
      <ComingSoon
        title="Project Creation"
        description="The project creation wizard is being built. You'll be able to set up projects with goals, milestones, and agent assignments."
        icon={<Rocket className="h-7 w-7" />}
        features={["Project templates", "Milestone tracking", "Agent assignments", "Progress dashboard"]}
      />
    </div>
  )
}
