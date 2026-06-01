# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Next.js dev server (port 3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm vitest       # Run unit tests (Vitest)
pnpm playwright   # Run E2E tests (Playwright)

# Database
pnpm prisma generate               # Generate Prisma Client
pnpm prisma migrate dev --name x   # Create + apply a new migration
pnpm prisma migrate dev            # Apply pending migrations
pnpm prisma studio                 # Open database GUI
```

## Tech Stack

- **Framework**: Next.js 16.2 (App Router), React 19.2
- **Database**: PostgreSQL 17 + pgvector (Docker: `pgvector/pgvector:pg17`)
- **ORM**: Prisma 7.8 (with `@prisma/adapter-pg` — see **Prisma 7** note below)
- **Auth**: NextAuth v5 (Auth.js, beta 31) — JWT strategy + PrismaAdapter
- **AI**: Vercel AI SDK v6 (`ai`) with `@ai-sdk/*` providers
- **Styling**: Tailwind CSS v4, `lucide-react` icons
- **Fonts**: Unbounded (display), DM Sans (body) — via next/font/google
- **State**: TanStack Query v5 (server state), Zustand v5 (client state)
- **Validation**: Zod v4
- **Streaming**: Custom SSE (`text/event-stream`)
- **Testing**: Vitest v4, Playwright v1.60

## Architecture Overview

### Route Groups
```
app/
├── (auth)/              # Public: /login, /register (animated canvas background)
├── (dashboard)/         # Protected: agents/, conversations/, collaborations/, projects/, tasks/, settings/
│   └── layout.tsx       # Sidebar + Header + MobileNav shell
└── api/                 # REST endpoints
    ├── auth/            # [...nextauth], register
    ├── agents/          # CRUD + [agentId]/chat (SSE streaming)
    ├── conversations/   # CRUD + messages/
    └── tools/           # List enabled tools
```

### Data Flow
- **Reads**: Server Components → direct Prisma query → props pass to children
- **Mutations**: Client Component → Server Action (`src/actions/`) → Prisma → `revalidatePath()`
- **API**: Client → `fetch()` → Route Handler → JSON/SSE response
- **AI Chat**: Client → `POST /api/agents/[id]/chat` → `streamText()` → SSE stream → `useChatStream` hook

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth v5 config (Credentials + GitHub + Google) |
| `src/middleware.ts` | Route protection via session cookie check |
| `src/lib/ai/provider-factory.ts` | AI model registry (Qwen, OpenAI, Anthropic, Google, Groq) |
| `src/lib/prisma.ts` | Prisma client singleton (PrismaPg adapter) |
| `src/lib/agents/tools/` | BaseTool, ToolExecutor, WebSearchTool, CalculatorTool |
| `src/app/api/agents/[agentId]/chat/route.ts` | SSE streaming chat endpoint |
| `prisma/schema.prisma` | 17 models: User, Agent, Tool, Conversation, Message, Task, Project, AgentCollaboration, AgentMemory, etc. |

## Critical Gotchas

### Prisma 7 Constructor
Do NOT use `new PrismaClient()` without options. Prisma 7 requires:
```ts
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
new PrismaClient({ adapter })
```
The old `datasources` property is also removed — pass `adapter` only.

### NextAuth v5 Cookie Name
Session cookie is named `authjs.session-token` (NOT `next-auth.session-token`). The middleware checks for this. If using a different NextAuth version, verify the cookie prefix.

### Model String Format
AI models use `"provider:model-id"` format, e.g. `"qwen:qwen3.7-max"`. Default is in `DEFAULT_MODEL` env var.

### Database Setup
PostgreSQL must be running. Connection string in `.env`:
```
DATABASE_URL="postgresql://agentforge:agentforge_secret@localhost:5432/agentforge"
```
After pulling, run: `pnpm prisma migrate dev` to apply migrations.

### Server Actions vs API Routes
Both exist in parallel:
- **Server Actions** (`src/actions/`) — form mutations with `revalidatePath`
- **API Routes** (`src/app/api/`) — programmatic access + streaming endpoints

The chat streaming endpoint is an API route (not a Server Action) because it needs SSE streaming.

## Project Status

### Done
- ✅ Auth: Registration with bcrypt, login, middleware protection
- ✅ Database: PostgreSQL 17 running locally (Windows service), all 17 Prisma models migrated
- ✅ AI Provider Factory: 5 providers configured (Qwen via DashScope domestic endpoint, OpenAI, Anthropic, Google, Groq)
- ✅ Tool System: BaseTool + WebSearch (Tavily/DuckDuckGo) + Calculator (mathjs), seeded in DB
- ✅ Chat API: SSE streaming with tool execution, message persistence, auto-conversation creation
- ✅ Agent CRUD: Server Actions + REST API + form UI
- ✅ Conversation CRUD: Server Actions + REST API
- ✅ Dashboard Layout: Sidebar, Header, MobileNav, responsive
- ✅ Auth Pages: Glass-morphism login/register with animated neural network background
- ✅ Typography: Unbounded + DM Sans via next/font
- ✅ Chat UI: Real SSE streaming verified end-to-end with Qwen models
- ✅ Agent creation UI: Tool configuration with checkbox selector verified
- ✅ Hydration fix: conversation-list.tsx `<button>` in `<button>` resolved

### Gotchas
- **Qwen API endpoint**: Must use `dashscope.aliyuncs.com` (domestic China) not `dashscope-intl.aliyuncs.com` — international endpoint is blocked by firewall
- **@ai-sdk/openai v3**: Defaults to Responses API format. Must use `.chat()` method for DashScope compatibility. Direct call `qwen(modelId)` uses Responses API which DashScope doesn't support
- **Tool schemas**: Must be OpenAI-compatible JSON Schema. The `buildZodSchema()` in chat route handles conversion

### In Progress / Next
- 🔶 Seed data for built-in Tools (currently empty — `web_search`, `calculator` need to be inserted)
- 🔶 Agent creation UI needs to be verified end-to-end with tool configuration
- 🔶 Chat UI needs end-to-end verification with streaming
- ❌ Memory system (AgentMemory + pgvector + MemoryManager) — Phase 3
- ❌ Swarm collaboration — Phase 4
- ❌ Project management + Kanban tasks — Phase 5
- ❌ Tests (Vitest + Playwright directories exist but are empty)
- ❌ Tool call UI components (collapsible cards, status indicators)
- ❌ Rate limiting (Upstash Redis optional)

## Environment Variables
Required: `DATABASE_URL`, `AUTH_SECRET`, at least one AI provider API key.
Optional: OAuth keys, `TAVILY_API_KEY` (web search), Redis URLs.
See `.env.example` for the full list.
