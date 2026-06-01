import { prisma } from "@/lib/prisma"
import { getModel } from "@/lib/ai"
import { streamText } from "ai"

interface SwarmAgent {
  id: string
  agentId: string
  order: number
  role: string | null
  agent: {
    id: string
    name: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
  }
}

export class SwarmEngine {
  /**
   * Execute a sequential swarm: each agent processes the task in order,
   * receiving the previous agent's output as context.
   */
  static async runSequential(
    collaborationId: string,
    userId: string
  ): Promise<{ success: boolean; result: string; error?: string }> {
    // 1. Fetch collaboration with ordered agents
    const collaboration = await prisma.agentCollaboration.findFirst({
      where: { id: collaborationId, userId },
      include: {
        agents: {
          orderBy: { order: "asc" },
          include: {
            agent: true,
          },
        },
      },
    })

    if (!collaboration) {
      return { success: false, result: "", error: "Collaboration not found" }
    }

    if (collaboration.agents.length === 0) {
      return { success: false, result: "", error: "No agents in collaboration" }
    }

    // 2. Update collaboration status to running
    await prisma.agentCollaboration.update({
      where: { id: collaborationId },
      data: { status: "running" },
    })

    const config = (collaboration.config as { task?: string }) || {}
    const task = config.task || "No task specified"
    const results: string[] = []
    let currentInput = task

    try {
      // 3. Execute agents sequentially
      for (const swarmAgent of collaboration.agents) {
        // Mark agent as running
        await prisma.agentCollaborationAgent.update({
          where: { id: swarmAgent.id },
          data: { status: "running", input: currentInput },
        })

        // Build system prompt with context from previous agents
        const contextHeader = results.length > 0
          ? `\n\nPrevious agent's output:\n${results[results.length - 1]}\n\n---\n`
          : ""

        const systemPrompt = `${swarmAgent.agent.systemPrompt}${contextHeader}`

        const model = getModel(swarmAgent.agent.model)

        // Call the AI (non-streaming for background execution)
        const { textStream } = streamText({
          model,
          system: systemPrompt,
          messages: [{ role: "user", content: currentInput }],
          temperature: swarmAgent.agent.temperature,
          maxOutputTokens: swarmAgent.agent.maxTokens,
        })

        // Collect the full response
        let fullResponse = ""
        for await (const chunk of textStream) {
          fullResponse += chunk
        }

        // Store the output
        await prisma.agentCollaborationAgent.update({
          where: { id: swarmAgent.id },
          data: {
            status: "completed",
            output: fullResponse,
          },
        })

        results.push(fullResponse)
        // Next agent receives this agent's output as context
        currentInput = fullResponse
      }

      // 4. Finalize collaboration
      const finalResult = results.join("\n\n---\n\n")
      await prisma.agentCollaboration.update({
        where: { id: collaborationId },
        data: {
          status: "completed",
          result: finalResult,
          completedAt: new Date(),
        },
      })

      return { success: true, result: finalResult }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      await prisma.agentCollaboration.update({
        where: { id: collaborationId },
        data: { status: "failed", error: errorMsg },
      })
      return { success: false, result: "", error: errorMsg }
    }
  }
}
