import { describe, it, expect } from "vitest"

describe("test infrastructure", () => {
  it("vitest runs correctly", () => {
    expect(1 + 1).toBe(2)
  })

  it("jsdom is available", () => {
    expect(typeof window).toBe("object")
    expect(typeof document).toBe("object")
  })

  it("jest-dom matchers are loaded", () => {
    const el = document.createElement("div")
    el.textContent = "hello"
    expect(el).toHaveTextContent("hello")
  })
})
