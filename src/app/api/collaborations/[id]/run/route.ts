import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { SwarmEngine } from "@/lib/agents/swarm/engine"

// POST /api/collaborations/[id]/run - Execute a sequential swarm
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Run asynchronously in background
  const result = await SwarmEngine.runSequential(id, session.user.id)

  if (result.success) {
    return NextResponse.json({ success: true, result: result.result })
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    )
  }
}
