export { BaseTool } from "./base-tool"
export type { ToolResult, ToolConfig, FunctionDefinition } from "./base-tool"
export { ToolExecutor } from "./tool-executor"
export type { ToolExecutionRequest, ToolExecutionResult } from "./tool-executor"
export { WebSearchTool } from "./web-search-tool"
export { CalculatorTool } from "./calculator-tool"

import { WebSearchTool } from "./web-search-tool"
import { CalculatorTool } from "./calculator-tool"

export function getDefaultTools() {
  return [
    new WebSearchTool(),
    new CalculatorTool(),
  ]
}
