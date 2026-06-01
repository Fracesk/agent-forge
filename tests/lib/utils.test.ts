import { describe, it, expect } from "vitest"
import { cn, formatDate, truncate, absoluteUrl } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("handles conditional classes with falsy values", () => {
    expect(cn("base", false && "hidden", null, undefined, "extra")).toBe("base extra")
  })

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("handles class-variance-authority style objects", () => {
    expect(cn("px-4", ["flex", "items-center"], { "text-red": true, "hidden": false }))
      .toBe("px-4 flex items-center text-red")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date(2026, 5, 1, 14, 30) // June 1, 2026, 14:30
    const result = formatDate(date)
    expect(result).toContain("2026")
    expect(result).toContain("6月")
    expect(result).toContain("14:30")
  })

  it("formats an ISO string", () => {
    const result = formatDate("2026-06-01T09:00:00Z")
    expect(result).toContain("2026")
  })

  it("handles edge dates", () => {
    const date = new Date("2024-01-01T00:00:00Z")
    const result = formatDate(date)
    expect(result).toContain("2024")
  })
})

describe("truncate", () => {
  it("returns the string unchanged if within length", () => {
    expect(truncate("hello", 10)).toBe("hello")
  })

  it("truncates with ellipsis when exceeding length", () => {
    expect(truncate("hello world this is long", 10)).toBe("hello worl...")
  })

  it("handles exact length", () => {
    expect(truncate("hello", 5)).toBe("hello")
  })

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("")
  })

  it("handles very short lengths", () => {
    expect(truncate("hello", 2)).toBe("he...")
  })
})

describe("absoluteUrl", () => {
  const originalEnv = process.env.AUTH_URL

  afterEach(() => {
    process.env.AUTH_URL = originalEnv
  })

  it("uses AUTH_URL env var when set", () => {
    process.env.AUTH_URL = "https://example.com"
    expect(absoluteUrl("/agents")).toBe("https://example.com/agents")
  })

  it("falls back to localhost when AUTH_URL is not set", () => {
    delete process.env.AUTH_URL
    expect(absoluteUrl("/agents")).toBe("http://localhost:3000/agents")
  })

  it("preserves the path as provided", () => {
    process.env.AUTH_URL = "https://app.agentforge.dev"
    expect(absoluteUrl("/api/tools")).toBe("https://app.agentforge.dev/api/tools")
  })
})
