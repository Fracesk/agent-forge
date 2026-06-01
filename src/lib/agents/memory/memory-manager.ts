import { prisma } from "@/lib/prisma"
import type { AgentMemory } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import {
  generateEmbedding,
  serializeEmbedding,
  deserializeEmbedding,
} from "./embedding"
import { rankMemoriesByQuery } from "./similarity"
import type {
  AgentMemoryData,
  CreateMemoryParams,
  UpdateMemoryParams,
  SearchOptions,
  SearchResult,
  ListMemoryOptions,
  MemoryType,
} from "./types"

export class MemoryManager {
  constructor(
    private readonly agentId: string,
    private readonly userId?: string
  ) {}

  // ==================== CRUD ====================

  async create(params: CreateMemoryParams): Promise<AgentMemory> {
    const embedding = await generateEmbedding(params.content)
    const importance =
      params.importance ?? calculateImportance(params.content)

    const memory = await prisma.agentMemory.create({
      data: {
        type: params.type,
        content: params.content,
        summary: params.summary,
        metadata: (params.metadata ?? {}) as Prisma.JsonObject,
        embedding: serializeEmbedding(embedding),
        importance,
        agentId: this.agentId,
        userId: this.userId,
      },
    })

    return memory
  }

  async get(id: string): Promise<AgentMemory | null> {
    const memory = await prisma.agentMemory.findFirst({
      where: { id, agentId: this.agentId },
    })

    if (memory) {
      // Touch lastAccessedAt asynchronously (fire-and-forget)
      prisma.agentMemory
        .update({ where: { id }, data: { lastAccessedAt: new Date() } })
        .catch(() => {})
    }

    return memory
  }

  async update(id: string, params: UpdateMemoryParams): Promise<AgentMemory> {
    const data: Prisma.AgentMemoryUpdateInput = {}

    if (params.type) data.type = params.type
    if (params.content) {
      data.content = params.content
      data.embedding = serializeEmbedding(await generateEmbedding(params.content))
    }
    if (params.summary !== undefined) data.summary = params.summary
    if (params.metadata !== undefined)
      data.metadata = params.metadata as Prisma.JsonObject
    if (params.importance !== undefined) data.importance = params.importance

    return prisma.agentMemory.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.agentMemory.delete({ where: { id } })
  }

  async list(options: ListMemoryOptions = {}): Promise<AgentMemory[]> {
    const where: Prisma.AgentMemoryWhereInput = { agentId: this.agentId }
    if (options.type) where.type = options.type

    const orderField = options.orderBy || "createdAt"
    const orderDir = options.orderDir || "desc"

    return prisma.agentMemory.findMany({
      where,
      orderBy: { [orderField]: orderDir },
      take: options.limit ?? 50,
      skip: options.offset ?? 0,
    })
  }

  // ==================== Semantic Search ====================

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const limit = options.limit ?? 5
    const minScore = options.minScore ?? 0.5

    // 1. Generate query embedding
    const queryEmbedding = await generateEmbedding(query)

    // 2. Fetch candidate memories
    const where: Prisma.AgentMemoryWhereInput = { agentId: this.agentId }
    if (options.types?.length) {
      where.type = { in: options.types }
    }

    const memories = await prisma.agentMemory.findMany({
      where,
      orderBy: { importance: "desc" },
    })

    if (memories.length === 0) return []

    // 3. Rank in application layer
    const ranked = rankMemoriesByQuery(
      memories.map((m) => ({ content: m.content, embedding: m.embedding })),
      queryEmbedding,
      query,
      minScore,
    )

    // 4. Map back to full memory objects
    const result: SearchResult[] = ranked
      .slice(0, limit)
      .map((r) => ({
        memory: memories[r.index] as unknown as AgentMemoryData,
        score: r.score,
      }))

    // 5. Touch lastAccessedAt on matched memories (fire-and-forget)
    for (const r of result) {
      prisma.agentMemory
        .update({
          where: { id: r.memory.id },
          data: { lastAccessedAt: new Date() },
        })
        .catch(() => {})
    }

    return result
  }

  // ==================== Importance Scoring ====================

  /**
   * Score the importance of content without an LLM call.
   * Returns a value between 0 and 1.
   */
  scoreImportance(content: string): number {
    return calculateImportance(content)
  }

  // ==================== Consolidation ====================

  /**
   * Delete low-importance memories that haven't been accessed in 30 days.
   * Returns the number of deleted memories.
   */
  async consolidate(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const stale = await prisma.agentMemory.findMany({
      where: {
        agentId: this.agentId,
        importance: { lte: 0.15 },
        lastAccessedAt: { lte: thirtyDaysAgo },
      },
      select: { id: true },
    })

    if (stale.length === 0) return 0

    const ids = stale.map((m) => m.id)
    await prisma.agentMemory.deleteMany({ where: { id: { in: ids } } })
    return ids.length
  }

  // ==================== Chat Integration ====================

  /**
   * Retrieve relevant memories formatted as context text for system prompt injection.
   */
  async getRelevantContext(
    query: string,
    maxChars = 2000
  ): Promise<string> {
    const results = await this.search(query, { limit: 5, minScore: 0.4 })
    if (results.length === 0) return ""

    const parts: string[] = []
    let totalLength = 0

    for (const r of results) {
      const relevance = (r.score * 100).toFixed(0)
      const header = `[${r.memory.type}] relevance=${relevance}%`
      const entry = `${header}\n${r.memory.content}`

      if (totalLength + entry.length > maxChars) break
      parts.push(entry)
      totalLength += entry.length
    }

    return parts.join("\n\n")
  }

  /**
   * Store a conversation exchange as an episodic memory.
   * Merges recent user+assistant pairs into a single memory entry.
   */
  async storeConversation(
    messages: Array<{ role: string; content: string }>
  ): Promise<void> {
    const pairs: string[] = []
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i]
      const next = messages[i + 1]
      if (msg.role === "user" && next.role === "assistant") {
        pairs.push(`User: ${msg.content}\nAssistant: ${next.content}`)
      }
    }

    if (pairs.length === 0) return

    const recentPairs = pairs.slice(-3).join("\n---\n")
    const summary = summarizeText(recentPairs)

    await this.create({
      type: "episodic",
      content: recentPairs,
      summary,
      metadata: { messageCount: messages.length },
    }).catch((err) => {
      console.error("[MemoryManager] Failed to store conversation:", err)
    })
  }
}

// ==================== Utility Functions ====================

/**
 * Rule-based importance scoring (no LLM call).
 * Base: 0.3. Keywords and length add bonuses.
 */
function calculateImportance(content: string): number {
  let score = 0.3
  const len = content.length

  if (len > 500) score += 0.1
  if (len > 2000) score += 0.1
  if (len > 5000) score += 0.1

  const importantKeywords = [
    "remember",
    "important",
    "critical",
    "必须",
    "重要",
    "记住",
    "preference",
    "project requirement",
    "deadline",
    "password",
    "api key",
    "configuration",
    "always",
    "never",
  ]

  const lower = content.toLowerCase()
  for (const kw of importantKeywords) {
    // Count unique keyword matches (max 0.5 additional from keywords)
    if (lower.includes(kw)) {
      score += 0.05
    }
  }

  // Instruction-like content
  if (lower.includes("always") || lower.includes("never")) {
    score += 0.1
  }

  return Math.min(Math.max(score, 0), 1)
}

/**
 * Generate a summary by truncating to first 200 characters.
 * (Future: upgrade to LLM-based summarization.)
 */
function summarizeText(text: string): string | undefined {
  const cleaned = text.replace(/\n+/g, " ").trim()
  if (cleaned.length <= 200) return undefined
  return cleaned.slice(0, 200) + "..."
}
