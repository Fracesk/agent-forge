import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, bio } = body

    // Validate that at least one field is provided
    if (name === undefined && bio === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Build update data — only include defined fields
    const data: Record<string, string> = {}
    if (name !== undefined) data.name = name
    if (bio !== undefined) data.bio = bio

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, bio: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[Profile PATCH] Failed to update profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
