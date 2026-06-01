import { auth } from "@/lib/auth"
import { MemoryManager } from "@/lib/agents/memory"
import { NextResponse } from "next/server"
import type { MemoryType } from "@/lib/agents/memory"

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

  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    )
  }

  const manager = new MemoryManager(agentId, session.user.id)
  const results = await manager.search(body.query, {
    limit: body.limit ?? 5,
    minScore: body.minScore ?? 0.5,
    types: body.types as MemoryType[] | undefined,
  })

  return NextResponse.json({ results })
}
