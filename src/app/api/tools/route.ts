import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tools = await prisma.tool.findMany({
    where: { enabled: true },
    orderBy: { category: "asc" },
  })

  return NextResponse.json(tools)
}
