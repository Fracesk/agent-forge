// ============================================================
// AgentForge — Seed Data
// ============================================================
// Run: pnpm prisma db seed
// or:  pnpm tsx prisma/seed.ts

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
})
const prisma = new PrismaClient({ adapter })

const TOOLS = [
  {
    name: "web_search",
    label: "Web Search",
    description:
      "Search the web for current information. Use this when you need to find recent news, data, or facts.",
    category: "search",
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "calculator",
    label: "Calculator",
    description:
      "Perform mathematical calculations. Supports basic arithmetic, trigonometry, logarithms, and more.",
    category: "calculation",
    schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "The mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(144)', 'sin(pi/2)')",
        },
      },
      required: ["expression"],
    },
  },
] as const

async function main() {
  console.log("🌱 Seeding database...")

  // --- Seed built-in tools ---
  console.log("\n📦 Seeding tools...")
  for (const tool of TOOLS) {
    const created = await prisma.tool.upsert({
      where: { name: tool.name },
      update: {
        label: tool.label,
        description: tool.description,
        category: tool.category,
        schema: tool.schema,
        enabled: true,
        builtIn: true,
      },
      create: {
        name: tool.name,
        label: tool.label,
        description: tool.description,
        category: tool.category,
        schema: tool.schema,
        enabled: true,
        builtIn: true,
      },
    })
    console.log(`  ✅ Tool: ${created.label} (${created.name})`)
  }

  // --- Optionally link tools to existing agents without tools ---
  const agentsWithoutTools = await prisma.agent.findMany({
    where: {
      tools: { none: {} },
    },
  })

  if (agentsWithoutTools.length > 0) {
    const allTools = await prisma.tool.findMany()
    console.log(`\n🔗 Linking tools to ${agentsWithoutTools.length} agent(s)...`)

    for (const agent of agentsWithoutTools) {
      for (const tool of allTools) {
        await prisma.agentTool.upsert({
          where: {
            agentId_toolId: { agentId: agent.id, toolId: tool.id },
          },
          update: {},
          create: {
            agentId: agent.id,
            toolId: tool.id,
          },
        })
      }
      console.log(`  ✅ ${agent.name}: linked ${allTools.length} tool(s)`)
    }
  } else {
    console.log("\n  ℹ️  No agents need tool linking")
  }

  // --- Summary ---
  const toolCount = await prisma.tool.count()
  const agentCount = await prisma.agent.count()
  const userCount = await prisma.user.count()
  console.log(`\n📊 Summary:`)
  console.log(`  Users:   ${userCount}`)
  console.log(`  Agents:  ${agentCount}`)
  console.log(`  Tools:   ${toolCount}`)
  console.log(`\n✅ Seed complete!`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
