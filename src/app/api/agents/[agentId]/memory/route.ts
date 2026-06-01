import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { MemoryManager } from "@/lib/agents/memory"
import { NextResponse } from "next/server"
import type { MemoryType, ListMemoryOptions } from "@/lib/agents/memory"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  const body = await req.json()

  // Verify ownership
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  })
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  if (!body.content || typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    )
  }

  const manager = new MemoryManager(agentId, session.user.id)
  const memory = await manager.create({
    type: body.type || "episodic",
    content: body.content,
    summary: body.summary,
    metadata: body.metadata,
    importance: body.importance,
  })

  return NextResponse.json(memory, { status: 201 })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  const url = new URL(req.url)
  const type = url.searchParams.get("type") as MemoryType | null
  const limit = parseInt(url.searchParams.get("limit") || "50")
  const offset = parseInt(url.searchParams.get("offset") || "0")
  const orderBy = (url.searchParams.get("orderBy") ||
    "createdAt") as ListMemoryOptions["orderBy"]
  const orderDir = (url.searchParams.get("orderDir") ||
    "desc") as ListMemoryOptions["orderDir"]

  const manager = new MemoryManager(agentId, session.user.id)
  const memories = await manager.list({
    type: type || undefined,
    limit,
    offset,
    orderBy,
    orderDir,
  })

  const total = await prisma.agentMemory.count({
    where: { agentId, ...(type ? { type } : {}) },
  })

  return NextResponse.json({ memories, total })
}
