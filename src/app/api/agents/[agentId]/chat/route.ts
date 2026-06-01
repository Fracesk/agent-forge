import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getModel } from "@/lib/ai"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"
import { ToolExecutor, getDefaultTools } from "@/lib/agents/tools"
import { MemoryManager } from "@/lib/agents/memory"

export const maxDuration = 60

// Reuse a single executor instance for tool lookups
const defaultExecutor = new ToolExecutor(getDefaultTools())

function buildZodSchema(properties: Record<string, any>): z.ZodObject<any> {
  const shape: Record<string, z.ZodType> = {}
  for (const [key, val] of Object.entries(properties)) {
    shape[key] = (val as any).type === "number" ? z.number() : z.string()
  }
  return z.object(shape)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  const { messages, conversationId } = await req.json()

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
    include: {
      tools: { include: { tool: true } },
    },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  let conversation
  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
    })
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        title: messages?.[0]?.content?.slice(0, 100) || "New Conversation",
        userId: session.user.id,
        agents: { connect: { id: agentId } },
      },
    })
  }

  const lastMessage = messages?.[messages.length - 1]
  if (lastMessage?.role === "user") {
    await prisma.message.create({
      data: {
        role: "user",
        content: lastMessage.content,
        conversationId: conversation.id,
        agentId,
      },
    })
  }

  const model = getModel(agent.model)

  // Build tools dynamically from the agent's configured tools.
  // The execute wrapper emits tool_start/tool_end SSE events for real-time UI updates.
  const tools: Record<string, any> = {}
  if (agent.tools?.length) {
    for (const agentTool of agent.tools) {
      const tool = defaultExecutor.getTool(agentTool.tool.name)
      if (tool) {
        tools[agentTool.tool.name] = {
          description: tool.description,
          parameters: buildZodSchema(tool.parameters.properties),
          execute: async (args: any, options?: { toolCallId?: string }) => {
            const toolCallId = options?.toolCallId || `${tool.name}-${Date.now()}`
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({ type: "tool_start", toolCallId, toolName: tool.name, args })}\n\n`
              )
            )
            const startTime = Date.now()
            const result = await tool.execute(args)
            const duration = Date.now() - startTime
            if (result.success) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "tool_end", toolCallId, toolName: tool.name, result: result.data, duration })}\n\n`
                )
              )
              return result.data
            } else {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "tool_error", toolCallId, toolName: tool.name, error: result.error, duration })}\n\n`
                )
              )
              return `Error: ${result.error}`
            }
          },
        }
      }
    }
  }

  const hasTools = Object.keys(tools).length > 0

  // === Memory: Inject relevant context ===
  let systemPrompt = agent.systemPrompt
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")
  if (lastUserMsg) {
    try {
      const memoryManager = new MemoryManager(agentId, session.user!.id)
      const context = await memoryManager.getRelevantContext(lastUserMsg.content, 1500)
      if (context) {
        systemPrompt += `\n\n---\nRelevant Memories:\n${context}\n---\n`
      }
    } catch (error) {
      console.error("[Chat] Failed to retrieve memories:", error)
    }
  }
  // === Memory end ===

  const encoder = new TextEncoder()
  const transformStream = new TransformStream()
  const writer = transformStream.writable.getWriter()

  // Stream response
  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    temperature: agent.temperature,
    maxOutputTokens: agent.maxTokens,
    ...(hasTools ? { tools } : {}),
  })

  ;(async () => {
    try {
      let fullText = ""
      const stream = result.textStream

      for await (const chunk of stream) {
        fullText += chunk
        const data = JSON.stringify({ type: "text", delta: chunk })
        await writer.write(encoder.encode(`data: ${data}\n\n`))
      }

      await prisma.message.create({
        data: {
          role: "assistant",
          content: fullText,
          conversationId: conversation.id,
          agentId,
          agentName: agent.name,
          model: agent.model,
        },
      })

      // === Memory: Store conversation ===
      try {
        const memoryManager = new MemoryManager(agentId, session.user!.id)
        const allMessages = [
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          { role: "assistant", content: fullText },
        ]
        memoryManager.storeConversation(allMessages).catch(console.error)
      } catch (error) {
        console.error("[Chat] Failed to store conversation memory:", error)
      }
      // === Memory end ===

      if (conversation.title === "New Conversation" && messages?.length <= 1) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { title: `Chat with ${agent.name}` },
        })
      }

      await writer.write(encoder.encode("data: [DONE]\n\n"))
    } catch (error) {
      const errData = JSON.stringify({ type: "error", message: "Stream failed" })
      await writer.write(encoder.encode(`data: ${errData}\n\n`))
    } finally {
      await writer.close()
    }
  })()

  return new Response(transformStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Conversation-Id": conversation.id,
    },
  })
}
