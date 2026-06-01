import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    include: {
      agents: {
        select: { id: true, name: true, avatarUrl: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(conversations)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { agentId, title } = body

  if (!agentId) {
    return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
  }

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: title || `Chat with ${agent.name}`,
      userId: session.user.id,
      agents: {
        connect: { id: agentId },
      },
    },
    include: {
      agents: true,
    },
  })

  return NextResponse.json({ conversation }, { status: 201 })
}
