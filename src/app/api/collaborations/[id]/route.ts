import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET /api/collaborations/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const collaboration = await prisma.agentCollaboration.findFirst({
    where: { id, userId: session.user.id },
    include: {
      agents: {
        include: { agent: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!collaboration) {
    return NextResponse.json({ error: "Collaboration not found" }, { status: 404 })
  }

  return NextResponse.json(collaboration)
}

// DELETE /api/collaborations/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.agentCollaboration.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: "Collaboration not found" }, { status: 404 })
  }

  await prisma.agentCollaboration.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
