export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface ToolConfig {
  timeout?: number
  [key: string]: unknown
}

// Simplified function definition for tool calling
export interface FunctionDefinition {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }
}

export abstract class BaseTool {
  abstract name: string
  abstract description: string
  abstract parameters: {
    type: "object"
    properties: Record<string, { type: string; description: string }>
    required?: string[]
  }

  config: ToolConfig = {}

  constructor(config?: ToolConfig) {
    if (config) this.config = config
  }

  abstract execute(args: Record<string, unknown>): Promise<ToolResult>

  toFunctionDefinition(): FunctionDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    }
  }
}
