import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { conversationId } = await params

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: {
      agents: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  return NextResponse.json(conversation)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { conversationId } = await params
  const body = await req.json()

  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const conversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
    },
  })

  return NextResponse.json(conversation)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { conversationId } = await params

  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  await prisma.conversation.delete({ where: { id: conversationId } })

  return NextResponse.json({ success: true })
}
