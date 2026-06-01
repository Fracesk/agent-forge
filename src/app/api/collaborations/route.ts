import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET /api/collaborations - List collaborations
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const collaborations = await prisma.agentCollaboration.findMany({
    where: { userId: session.user.id },
    include: {
      agents: {
        include: { agent: { select: { id: true, name: true } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { agents: true, tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(collaborations)
}

// POST /api/collaborations - Create a collaboration
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, strategy = "sequential", maxRounds = 5, agentIds = [], config } = body

    // Create collaboration with optional agent assignments
    const collaboration = await prisma.agentCollaboration.create({
      data: {
        name,
        description,
        strategy,
        maxRounds,
        config: config || {},
        userId: session.user.id,
        agents: {
          create: agentIds.map((agentId: string, index: number) => ({
            agentId,
            order: index,
            status: "pending",
          })),
        },
      },
      include: {
        agents: {
          include: { agent: { select: { id: true, name: true } } },
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json({ collaboration }, { status: 201 })
  } catch (error) {
    console.error("[Collaborations POST]", error)
    return NextResponse.json({ error: "Failed to create collaboration" }, { status: 500 })
  }
}
