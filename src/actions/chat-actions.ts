"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

export async function createConversation(agentId: string, title?: string) {
  const userId = await requireAuth()

  const conversation = await prisma.conversation.create({
    data: {
      title: title || "New Conversation",
      userId,
      agents: {
        connect: { id: agentId },
      },
    },
    include: {
      agents: true,
    },
  })

  revalidatePath("/conversations")
  return { success: true, conversation }
}

export async function getConversations() {
  const userId = await requireAuth()

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    include: {
      agents: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return conversations
}

export async function getConversationMessages(conversationId: string) {
  const userId = await requireAuth()

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  })

  if (!conversation) throw new Error("Conversation not found")

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  })

  return messages
}

export async function deleteConversation(id: string) {
  const userId = await requireAuth()

  const existing = await prisma.conversation.findFirst({ where: { id, userId } })
  if (!existing) throw new Error("Conversation not found")

  await prisma.conversation.delete({ where: { id } })

  revalidatePath("/conversations")
  return { success: true }
}

export async function updateConversationTitle(id: string, title: string) {
  const userId = await requireAuth()

  await prisma.conversation.updateMany({
    where: { id, userId },
    data: { title },
  })

  revalidatePath("/conversations")
  return { success: true }
}
