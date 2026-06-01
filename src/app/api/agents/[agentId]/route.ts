import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse
  }

  const { agentId } = await params

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
    include: {
      tools: {
        include: { tool: true },
      },
      _count: {
        select: { conversations: true, memories: true, tasks: true },
      },
    },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json(agent)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  const body = await req.json()

  const existing = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const { toolIds, ...updateData } = body

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      ...updateData,
      ...(toolIds !== undefined
        ? {
            tools: {
              deleteMany: {},
              create: toolIds.map((toolId: string) => ({
                toolId,
              })),
            },
          }
        : {}),
    },
    include: {
      tools: {
        include: { tool: true },
      },
    },
  })

  return NextResponse.json(agent)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params

  const existing = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  await prisma.agent.delete({ where: { id: agentId } })

  return NextResponse.json({ success: true })
}
