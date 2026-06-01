import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const userId = session.user.id

  const agents = await prisma.agent.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      tools: {
        include: { tool: true },
      },
      _count: {
        select: { conversations: true, memories: true, tasks: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(agents)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, systemPrompt, model, temperature, maxTokens, toolIds, personality, role } = body

  if (!name || !systemPrompt) {
    return NextResponse.json(
      { error: "Name and system prompt are required" },
      { status: 400 }
    )
  }

  const agent = await prisma.agent.create({
    data: {
      name,
      description,
      systemPrompt,
      model: model || "qwen:qwen3.7-max",
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
      personality: personality ?? {},
      role,
      userId: session.user.id,
      ...(toolIds?.length
        ? {
            tools: {
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

  return NextResponse.json(agent, { status: 201 })
}
