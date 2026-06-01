import { describe, it, expect } from "vitest"
import { cosineSimilarity, keywordScore, rankMemoriesByQuery } from "@/lib/agents/memory/similarity"

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3]
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5)
  })

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0, 0]
    const b = [0, 1, 0]
    expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5)
  })

  it("returns positive value for similar vectors", () => {
    const a = [1, 2, 3]
    const b = [2, 4, 6]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
  })

  it("returns 0 for empty vectors", () => {
    expect(cosineSimilarity([], [])).toBe(0)
  })

  it("returns 0 for vectors of different lengths", () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
  })

  it("returns 0 when one vector is all zeros", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it("handles negative values", () => {
    const a = [1, -1]
    const b = [-1, 1]
    const result = cosineSimilarity(a, b)
    expect(result).toBeLessThan(0)
  })
})

describe("keywordScore", () => {
  it("returns high score for exact match", () => {
    const score = keywordScore("machine learning", "Machine learning is great")
    expect(score).toBeGreaterThan(0.8)
  })

  it("returns 0 for no match", () => {
    const score = keywordScore("quantum physics", "I like cooking pasta")
    expect(score).toBe(0)
  })

  it("returns partial score for partial match", () => {
    const score = keywordScore("machine learning AI", "Machine learning is a field")
    expect(score).toBeGreaterThan(0.3)
    expect(score).toBeLessThan(1)
  })

  it("returns 0 for empty query terms", () => {
    expect(keywordScore("a", "anything")).toBe(0)
  })

  it("is case insensitive", () => {
    const upper = keywordScore("HELLO", "hello world")
    const lower = keywordScore("hello", "HELLO WORLD")
    expect(upper).toBe(lower)
    expect(upper).toBeGreaterThan(0)
  })

  it("ignores single-character terms", () => {
    const score = keywordScore("a b c machine learning", "Machine learning is great")
    expect(score).toBeGreaterThan(0.8) // Only "machine" and "learning" count
  })
})

describe("rankMemoriesByQuery", () => {
  const memories = [
    { content: "Machine learning is a subset of AI", embedding: "[0.1,0.2,0.3]" },
    { content: "I like cooking Italian pasta", embedding: "[0.9,0.8,0.7]" },
    { content: "Deep learning uses neural networks", embedding: "[0.15,0.25,0.35]" },
  ]

  it("ranks relevant memories higher", () => {
    const results = rankMemoriesByQuery(memories, [0.1, 0.2, 0.3], "machine learning")
    expect(results.length).toBeGreaterThan(0)
    // Memory about ML should rank higher than cooking
    const mlIndex = memories.findIndex((m) => m.content.includes("Machine"))
    const cookingIndex = memories.findIndex((m) => m.content.includes("cooking"))
    const mlResult = results.find((r) => r.index === mlIndex)
    const cookingResult = results.find((r) => r.index === cookingIndex)
    if (mlResult && cookingResult) {
      expect(mlResult.score).toBeGreaterThan(cookingResult.score)
    }
  })

  it("filters by minScore", () => {
    // Use minScore above 1.0 so no results pass
    const results = rankMemoriesByQuery(memories, [0.1, 0.2, 0.3], "machine learning", 1.5)
    expect(results.length).toBe(0)
  })

  it("returns empty array for empty memories", () => {
    const results = rankMemoriesByQuery([], [0.1, 0.2], "test")
    expect(results).toEqual([])
  })

  it("handles null embeddings gracefully", () => {
    const memWithNull = [
      { content: "test content", embedding: null },
    ]
    const results = rankMemoriesByQuery(memWithNull, [0, 0], "test")
    // Falls back to keyword score
    expect(results.length).toBe(1)
    expect(results[0].score).toBeGreaterThan(0)
  })
})
