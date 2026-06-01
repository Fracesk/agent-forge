import { BaseTool, type ToolResult } from "./base-tool"

export interface ToolExecutionRequest {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolExecutionResult {
  id: string
  name: string
  result: ToolResult
  durationMs: number
}

export class ToolExecutor {
  private tools: Map<string, BaseTool> = new Map()

  constructor(tools: BaseTool[]) {
    for (const tool of tools) {
      this.tools.set(tool.name, tool)
    }
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool)
  }

  getTool(name: string): BaseTool | undefined {
    return this.tools.get(name)
  }

  getAllTools(): BaseTool[] {
    return Array.from(this.tools.values())
  }

  toFunctionDefinitions() {
    return this.getAllTools().map((tool) => tool.toFunctionDefinition())
  }

  async execute(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const tool = this.tools.get(request.name)
    const startTime = Date.now()

    if (!tool) {
      return {
        id: request.id,
        name: request.name,
        result: { success: false, error: `Tool "${request.name}" not found` },
        durationMs: Date.now() - startTime,
      }
    }

    const timeout = tool.config.timeout ?? 30000

    try {
      const result = await withTimeout(tool.execute(request.arguments), timeout)

      return {
        id: request.id,
        name: request.name,
        result,
        durationMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        id: request.id,
        name: request.name,
        result: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        durationMs: Date.now() - startTime,
      }
    }
  }

  async executeAll(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]> {
    return Promise.all(requests.map((req) => this.execute(req)))
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Tool execution timed out after ${ms}ms`)), ms)
    ),
  ])
}
