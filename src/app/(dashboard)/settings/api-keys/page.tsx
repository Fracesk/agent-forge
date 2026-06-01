import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Key } from "lucide-react"

export default function ApiKeysPage() {
  return (
    <div>
      <PageHeader
        title="API 密钥"
        description="用于程序化访问的 API 密钥"
      />
      <EmptyState
        icon={Key}
        title="还没有 API 密钥"
        description="生成 API 密钥以编程方式使用 AgentForge。"
      />
    </div>
  )
}
