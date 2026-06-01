// Define a minimal interface matching Prisma's AgentMemory
// We avoid importing @prisma/client here to prevent client-side bundling issues.
export interface AgentMemoryData {
  id: string
  type: string
  content: string
  summary: string | null
  metadata: Record<string, unknown> | null
  embedding: string | null
  importance: number
  agentId: string
  userId: string | null
  createdAt: Date | string
  lastAccessedAt: Date | string
}

export type MemoryType = "episodic" | "semantic" | "procedural"

export interface CreateMemoryParams {
  type: MemoryType
  content: string
  summary?: string
  metadata?: Record<string, unknown>
  importance?: number
}

export interface UpdateMemoryParams {
  type?: MemoryType
  content?: string
  summary?: string
  metadata?: Record<string, unknown>
  importance?: number
}

export interface SearchOptions {
  limit?: number
  minScore?: number
  types?: MemoryType[]
}

export interface SearchResult {
  memory: AgentMemoryData
  score: number
}

export interface ListMemoryOptions {
  type?: MemoryType
  limit?: number
  offset?: number
  orderBy?: "importance" | "createdAt" | "lastAccessedAt"
  orderDir?: "asc" | "desc"
}

export const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  episodic: "Episodic",
  semantic: "Semantic",
  procedural: "Procedural",
}

export const MEMORY_TYPE_COLORS: Record<MemoryType, string> = {
  episodic: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  semantic: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  procedural: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "text-embedding-v3"
