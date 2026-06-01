/**
 * Application-layer cosine similarity + keyword fallback.
 * Used when pgvector is not available.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0

  return dotProduct / denominator
}

/**
 * Simplified keyword-based relevance score.
 * Used as fallback when embeddings are unavailable.
 */
export function keywordScore(query: string, content: string): number {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
  if (queryTerms.length === 0) return 0

  const contentLower = content.toLowerCase()
  let matches = 0
  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      matches++
    }
  }

  const ratio = matches / queryTerms.length
  // Normalize: diminishing returns via log scale
  return ratio > 0 ? Math.min(0.3 + ratio * 0.7, 1) : 0
}

function deserializeEmbedding(
  stored: string | null | undefined
): number[] | null {
  if (!stored) return null
  try {
    return JSON.parse(stored) as number[]
  } catch {
    return null
  }
}

export interface RankedMemory {
  content: string
  embedding: string | null
}

export function rankMemoriesByQuery(
  memories: RankedMemory[],
  queryEmbedding: number[],
  queryText: string,
  minScore = 0.3
): Array<{ index: number; score: number }> {
  const hasValidEmbedding = queryEmbedding.some((v) => v !== 0)

  const scored = memories.map((memory, index) => {
    let semanticScore = 0
    if (hasValidEmbedding) {
      const memEmbedding = deserializeEmbedding(memory.embedding)
      if (memEmbedding) {
        semanticScore = cosineSimilarity(queryEmbedding, memEmbedding)
      }
    }

    const kwScore = keywordScore(queryText, memory.content)

    // Weight: 70% semantic + 30% keyword when embedding available
    // Fall back to 100% keyword when embedding is a zero-vector
    const combined = hasValidEmbedding
      ? semanticScore * 0.7 + kwScore * 0.3
      : kwScore

    return { index, score: combined }
  })

  return scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
}
