import { BaseTool, type ToolResult } from "./base-tool"

export class CalculatorTool extends BaseTool {
  name = "calculator"
  description = "Perform mathematical calculations. Supports basic arithmetic, trigonometry, logarithms, and more."
  parameters = {
    type: "object" as const,
    properties: {
      expression: {
        type: "string",
        description: "The mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(144)', 'sin(pi/2)')",
      },
    },
    required: ["expression"] as string[],
  }

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const expression = args.expression as string

    if (!expression) {
      return { success: false, error: "Expression is required" }
    }

    try {
      // Use mathjs for safe evaluation
      const { create, all } = await import("mathjs")
      const math = create(all, {})

      const result = math.evaluate(expression)

      return {
        success: true,
        data: {
          expression,
          result: math.format(result, { precision: 14 }),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: `Calculation error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
}
