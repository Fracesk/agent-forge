"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAgentMemories, useDeleteMemory, useMemorySearch } from "@/hooks/use-agent-memory"
import { MemoryCard } from "@/components/agents/memory-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Brain, Search, Loader2, X } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
}

interface MemoryListProps {
  agentId: string
}

const TYPE_TABS = [
  { value: undefined, label: "全部" },
  { value: "episodic", label: "情景" },
  { value: "semantic", label: "语义" },
  { value: "procedural", label: "程序" },
] as const

export function MemoryList({ agentId }: MemoryListProps) {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const { data, isLoading, error } = useAgentMemories(agentId, typeFilter)
  const deleteMemory = useDeleteMemory(agentId)
  const memorySearch = useMemorySearch(agentId)

  const memories = data?.memories || []
  const total = data?.total || 0
  const searchResults = memorySearch.data?.results || []

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      return
    }
    setShowSearchResults(true)
    await memorySearch.mutateAsync({
      query: searchQuery,
      limit: 10,
      minScore: 0.3,
    })
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    memorySearch.reset()
  }

  const handleDelete = (id: string) => {
    deleteMemory.mutate(id)
  }

  const displayMemories = showSearchResults
    ? searchResults.map((r) => r.memory)
    : memories

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
          placeholder="搜索记忆..."
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setTypeFilter(tab.value)
              setShowSearchResults(false)
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {showSearchResults && (
          <span className="ml-auto text-xs text-muted-foreground">
            搜索结果
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Failed to load memories. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && displayMemories.length === 0 && (
        <EmptyState
          icon={Brain}
          title={showSearchResults ? "没有匹配的记忆" : "还没有记忆"}
          description={
            showSearchResults
              ? "试试其他搜索词。"
              : "当你与代理聊天时，记忆会自动创建。"
          }
        />
      )}

      {/* Memory list */}
      {!isLoading && !error && displayMemories.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {showSearchResults
              ? `${searchResults.length} 个结果`
              : `${total} 条记忆`}
          </p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {displayMemories.map((memory) => (
              <motion.div key={memory.id} variants={itemVariants}>
                <MemoryCard
                  memory={memory}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}
