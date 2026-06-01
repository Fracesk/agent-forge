/**
 * Embedding generation using Qwen DashScope API via @ai-sdk/openai.
 *
 * Reuses the same provider configuration as provider-factory.ts.
 * Falls back to zero-vector when API is unavailable.
 */

import { embed } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { EMBEDDING_MODEL } from "./types"

const qwenEmbedding = createOpenAI({
  name: "qwen-embedding",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  apiKey: process.env.QWEN_API_KEY ?? "",
})

// Simple in-memory cache to avoid re-embedding identical text
const embeddingCache = new Map<string, number[]>()

export async function generateEmbedding(text: string): Promise<number[]> {
  // Normalize and truncate for cache key
  const cacheKey = text.trim().toLowerCase().slice(0, 500)
  const cached = embeddingCache.get(cacheKey)
  if (cached) return cached

  // Truncate extremely long text (8000 chars ≈ ~2k tokens)
  const truncated = text.length > 8000 ? text.slice(0, 8000) : text

  try {
    const model = qwenEmbedding.embedding(EMBEDDING_MODEL)
    const result = await embed({
      model,
      value: truncated,
      maxRetries: 2,
    })
    const vector = result.embedding as number[]

    embeddingCache.set(cacheKey, vector)
    return vector
  } catch (error) {
    console.error("[Memory/Embedding] Failed to generate embedding:", error)
    // Fallback: zero-vector (search degrades to keyword-only)
    return new Array(1024).fill(0)
  }
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const { embedMany } = await import("ai")
  const truncated = texts.map((t) =>
    t.length > 8000 ? t.slice(0, 8000) : t
  )

  try {
    const model = qwenEmbedding.embedding(EMBEDDING_MODEL)
    const result = await embedMany({
      model,
      values: truncated,
      maxRetries: 2,
    })
    return result.embeddings as number[][]
  } catch (error) {
    console.error("[Memory/Embedding] Failed to generate embeddings:", error)
    return texts.map(() => new Array(1024).fill(0))
  }
}

export function serializeEmbedding(embedding: number[]): string {
  return JSON.stringify(embedding)
}

export function deserializeEmbedding(
  stored: string | null | undefined
): number[] | null {
  if (!stored) return null
  try {
    return JSON.parse(stored) as number[]
  } catch {
    return null
  }
}

/** Clear the embedding cache (useful for testing) */
export function clearEmbeddingCache(): void {
  embeddingCache.clear()
}
