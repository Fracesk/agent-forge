"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  model: z.string().default("qwen:qwen3.7-max"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(256).max(32000).default(4096),
  toolIds: z.array(z.string()).optional(),
})

export async function createAgent(formData: FormData) {
  const userId = await requireAuth()

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    systemPrompt: formData.get("systemPrompt") as string,
    model: (formData.get("model") as string) || "qwen:qwen3.7-max",
    temperature: parseFloat(formData.get("temperature") as string) || 0.7,
    maxTokens: parseInt(formData.get("maxTokens") as string) || 4096,
    toolIds: JSON.parse((formData.get("toolIds") as string) || "[]"),
  }

  const validated = createAgentSchema.parse(data)

  const agent = await prisma.agent.create({
    data: {
      ...validated,
      userId,
      tools: {
        create: (validated.toolIds || []).map((toolId) => ({ toolId })),
      },
    },
  })

  revalidatePath("/agents")
  return { success: true, agent }
}

export async function updateAgent(id: string, formData: FormData) {
  const userId = await requireAuth()

  const existing = await prisma.agent.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Agent not found")

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    systemPrompt: formData.get("systemPrompt") as string,
    model: (formData.get("model") as string) || "qwen:qwen3.7-max",
    temperature: parseFloat(formData.get("temperature") as string) || 0.7,
    maxTokens: parseInt(formData.get("maxTokens") as string) || 4096,
    toolIds: JSON.parse((formData.get("toolIds") as string) || "[]"),
  }

  const validated = createAgentSchema.parse(data)

  await prisma.agent.update({
    where: { id },
    data: {
      ...validated,
      tools: {
        deleteMany: {},
        create: (validated.toolIds || []).map((toolId) => ({ toolId })),
      },
    },
  })

  revalidatePath("/agents")
  revalidatePath(`/agents/${id}`)
  return { success: true }
}

export async function deleteAgent(id: string) {
  const userId = await requireAuth()

  const existing = await prisma.agent.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Agent not found")

  await prisma.agent.delete({ where: { id } })

  revalidatePath("/agents")
  return { success: true }
}

export async function toggleAgentTool(agentId: string, toolId: string, enabled: boolean) {
  const userId = await requireAuth()

  const existing = await prisma.agent.findFirst({ where: { id: agentId, userId } })
  if (!existing) throw new Error("Agent not found")

  if (enabled) {
    await prisma.agentTool.create({ data: { agentId, toolId } })
  } else {
    await prisma.agentTool.delete({ where: { agentId_toolId: { agentId, toolId } } })
  }

  revalidatePath(`/agents/${agentId}`)
  return { success: true }
}

export async function duplicateAgent(id: string) {
  const userId = await requireAuth()

  const original = await prisma.agent.findFirst({
    where: { id, userId },
    include: { tools: true },
  })

  if (!original) throw new Error("Agent not found")

  const agent = await prisma.agent.create({
    data: {
      name: `${original.name} (Copy)`,
      description: original.description,
      systemPrompt: original.systemPrompt,
      model: original.model,
      temperature: original.temperature,
      maxTokens: original.maxTokens,
      personality: original.personality as any,
      role: original.role,
      userId,
      tools: {
        create: original.tools.map((t) => ({ toolId: t.toolId })),
      },
    },
  })

  revalidatePath("/agents")
  return { success: true, agent }
}
