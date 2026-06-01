import { BaseTool, type ToolResult } from "./base-tool"

interface WebSearchArgs {
  query: string
  maxResults?: number
}

export class WebSearchTool extends BaseTool {
  name = "web_search"
  description = "Search the web for current information. Use this when you need to find recent news, data, or facts."
  parameters = {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "The search query",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 5)",
      },
    },
    required: ["query"] as string[],
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const { query, maxResults } = args as unknown as WebSearchArgs

    if (!query) {
      return { success: false, error: "Search query is required" }
    }

    try {
      const count = maxResults || 5

      // Try Tavily first if API key is available
      if (process.env.TAVILY_API_KEY) {
        return await this.searchWithTavily(query, count)
      }

      // Fallback to a simple search API
      return await this.searchWithFallback(query, count)
    } catch (error) {
      return {
        success: false,
        error: `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  private async searchWithTavily(query: string, maxResults: number): Promise<ToolResult> {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        include_answer: true,
      }),
    })

    if (!res.ok) {
      throw new Error(`Tavily API error: ${res.status}`)
    }

    const data = await res.json()

    return {
      success: true,
      data: {
        answer: data.answer,
        results: data.results?.map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
        })),
      },
    }
  }

  private async searchWithFallback(query: string, maxResults: number): Promise<ToolResult> {
    const encoded = encodeURIComponent(query)
    const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Search API error: ${res.status}`)

    const data = await res.json()

    const results = []
    if (data.AbstractText) {
      results.push({
        title: data.AbstractSource || "Summary",
        url: data.AbstractURL || "",
        content: data.AbstractText,
      })
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(" - ")[0] || "Related",
            url: topic.FirstURL || "",
            content: topic.Text,
          })
        }
      }
    }

    return {
      success: true,
      data: { results },
    }
  }
}
