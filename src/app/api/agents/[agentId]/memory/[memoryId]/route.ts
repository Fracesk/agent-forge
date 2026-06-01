import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { MemoryManager } from "@/lib/agents/memory"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string; memoryId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId, memoryId } = await params
  const manager = new MemoryManager(agentId, session.user.id)
  const memory = await manager.get(memoryId)

  if (!memory) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 })
  }

  return NextResponse.json(memory)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ agentId: string; memoryId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId, memoryId } = await params
  const body = await req.json()

  const manager = new MemoryManager(agentId, session.user.id)
  const existing = await manager.get(memoryId)
  if (!existing) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 })
  }

  const memory = await manager.update(memoryId, {
    type: body.type,
    content: body.content,
    summary: body.summary,
    metadata: body.metadata,
    importance: body.importance,
  })

  return NextResponse.json(memory)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ agentId: string; memoryId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId, memoryId } = await params
  const manager = new MemoryManager(agentId, session.user.id)

  const existing = await manager.get(memoryId)
  if (!existing) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 })
  }

  await manager.delete(memoryId)
  return NextResponse.json({ success: true })
}
