import { describe, it, expect } from "vitest"
import { CalculatorTool } from "@/lib/agents/tools"

describe("CalculatorTool", () => {
  const tool = new CalculatorTool()

  it("has the correct name and description", () => {
    expect(tool.name).toBe("calculator")
    expect(tool.description).toContain("mathematical")
  })

  it("adds two numbers", async () => {
    const result = await tool.execute({ expression: "2 + 2" })
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    if (result.data) {
      expect((result.data as any).result).toBe("4")
    }
  })

  it("handles complex expressions", async () => {
    const result = await tool.execute({ expression: "sqrt(144) + 10 * 2" })
    expect(result.success).toBe(true)
    if (result.data) {
      expect((result.data as any).result).toBe("32")
    }
  })

  it("handles trigonometric functions", async () => {
    const result = await tool.execute({ expression: "sin(pi / 2)" })
    expect(result.success).toBe(true)
    if (result.data) {
      expect((result.data as any).result).toBe("1")
    }
  })

  it("returns expression in data", async () => {
    const result = await tool.execute({ expression: "3 * 7" })
    expect(result.success).toBe(true)
    if (result.data) {
      expect((result.data as any).expression).toBe("3 * 7")
    }
  })

  it("rejects empty expression", async () => {
    const result = await tool.execute({ expression: "" })
    expect(result.success).toBe(false)
    expect(result.error).toContain("required")
  })

  it("rejects missing expression argument", async () => {
    const result = await tool.execute({})
    expect(result.success).toBe(false)
    expect(result.error).toContain("required")
  })

  it("handles syntax errors gracefully", async () => {
    const result = await tool.execute({ expression: "2 + +" })
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("handles division by zero", async () => {
    const result = await tool.execute({ expression: "1 / 0" })
    expect(result.success).toBe(true)
    if (result.data) {
      expect((result.data as any).result).toBe("Infinity")
    }
  })

  it("handles large numbers", async () => {
    const result = await tool.execute({ expression: "10^6" })
    expect(result.success).toBe(true)
    if (result.data) {
      expect(Number((result.data as any).result)).toBe(1000000)
    }
  })
})
