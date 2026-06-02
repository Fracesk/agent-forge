# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Next.js dev server (port 3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run unit tests (Vitest watch mode)
pnpm test:run     # Run unit tests (single run)
pnpm test:watch   # Run Vitest in watch mode
pnpm playwright   # Run E2E tests (Playwright)
pnpm db:seed      # Seed database (built-in tools)

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
- **Styling**: Tailwind CSS v4, `lucide-react` icons, Framer Motion
- **Fonts**: Unbounded (display), DM Sans (body) — via next/font/google
- **State**: TanStack Query v5 (server state), Zustand v5 (client state), nuqs (URL params)
- **Validation**: Zod v4
- **Streaming**: Custom SSE (`text/event-stream`) with tool_start/tool_end events
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
    ├── agents/          # CRUD + [agentId]/chat (SSE) + [agentId]/memory (CRUD + search)
    ├── conversations/   # CRUD + messages/
    ├── tools/           # List enabled tools
    └── collaborations/  # CRUD + run
```

### Three Data Flow Patterns
- **Server Component Reads**: Page → direct Prisma query → props to children. Used for initial data loading.
- **Client → Server Actions** (`src/actions/`): form mutations with Zod validation → Prisma → `revalidatePath()`. Used for form-based CRUD (agents, conversations).
- **Client → API Routes** (`src/app/api/`): `fetch()` → Route Handler → JSON/SSE response. Used for programmatic access and streaming (chat is an API route, not a Server Action, because it needs SSE).

### AI Chat Flow (Core Path)
```
Client (useChatStream hook)
  → POST /api/agents/[id]/chat  (SSE connection)
    → Load agent + tools from DB
    → Create/find conversation, save user message
    → MemoryManager.search() → inject relevant memories into system prompt
    → streamText(model, system, tools)
    → For each tool call, emit tool_start / tool_end SSE events via writer.write()
    → Stream text chunks as SSE "text" events
    → On completion: save assistant message, store conversation as episodic memory
    → Emit [DONE]
```

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth v5 config (Credentials + GitHub + Google) |
| `src/middleware.ts` | Route protection via session cookie check |
| `src/lib/ai/provider-factory.ts` | AI model registry (6 providers) |
| `src/lib/prisma.ts` | Prisma client singleton (PrismaPg adapter) |
| `src/lib/agents/tools/` | BaseTool, ToolExecutor, WebSearchTool, CalculatorTool |
| `src/lib/agents/memory/` | MemoryManager, embedding (Qwen text-embedding-v3), cosine similarity |
| `src/lib/agents/swarm/engine.ts` | Sequential swarm collaboration engine |
| `src/hooks/use-chat-stream.ts` | Client-side SSE parser, message state, abort support |
| `src/hooks/use-agents.ts` | TanStack Query wrappers for agent CRUD |
| `prisma/schema.prisma` | 17 models: User, Agent, Tool, Conversation, Message, Task, Project, AgentCollaboration, AgentMemory, etc. |

### Memory System
- **Embedding**: Qwen DashScope `text-embedding-v3` via `@ai-sdk/openai` (1024-dim vectors), with in-memory cache and zero-vector fallback
- **Similarity**: Application-layer cosine similarity (70%) + keyword scoring (30%) — NO pgvector yet. Embeddings stored as JSON strings in `AgentMemory.embedding`
- **Memory Types**: `episodic` (conversations), `semantic` (facts), `instructional` (rules/guidelines)
- **Chat Integration**: `MemoryManager.getRelevantContext()` retrieves top-5 memories before each chat turn → injected into system prompt as `---\nRelevant Memories:\n...\n---`
- **Importance**: Rule-based scoring (keywords + content length), consolidation deletes low-importance memories untouched for 30 days

### Swarm Collaboration
- `SwarmEngine.runSequential()` executes agents in order, passing each agent's output as context to the next
- Supports sequential strategy; each agent runs with full system prompt + previous agent's output
- Status tracking at collaboration and per-agent level

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
AI models use `"provider:model-id"` format, e.g. `"qwen:qwen3.7-max"`. Default is in `DEFAULT_MODEL` env var. DeepSeek is routed through the Anthropic SDK (not a separate provider).

### Qwen / DashScope API
- Must use `dashscope.aliyuncs.com` (domestic China endpoint), NOT `dashscope-intl.aliyuncs.com`
- `@ai-sdk/openai` v3 defaults to Responses API format. Use `.chat()` method for DashScope compatibility — direct `qwen(modelId)` uses Responses API which DashScope doesn't support

### Stale Closure Pattern in useChatStream
The `useChatStream` hook intentionally uses `messagesRef.current` to avoid stale closures. The `sendMessage` callback reads from the ref (not the `messages` state dependency) so it doesn't rebuild on every stream update. Do NOT "fix" this by adding `messages` to the dependency array.

### Memory Performance
Embeddings are stored as JSON strings (not pgvector). `MemoryManager.search()` loads ALL memories for an agent into memory and ranks them with application-layer cosine similarity — O(n) per search. Fine for <5000 memories; beyond that, migrate to pgvector.

### Tool Schemas Must Be OpenAI-Compatible JSON Schema
The `buildZodSchema()` in the chat route converts tool parameter properties to Zod schemas. The AI SDK requires OpenAI-compatible JSON Schema format — use `z.string()` / `z.number()` mapping.

### Server Actions vs API Routes
Both exist in parallel for different use cases:
- **Server Actions** (`src/actions/`) — form mutations with `revalidatePath`. Accept `FormData`, validate with Zod.
- **API Routes** (`src/app/api/`) — programmatic access + streaming endpoints. Accept/return JSON or SSE.

The chat streaming endpoint is an API route (needs SSE). Agent CRUD has BOTH a Server Action AND an API route.

## Project Status

### Fully Implemented
- Auth (Credentials + GitHub + Google OAuth, bcrypt, JWT, middleware)
- Database (17 Prisma models, all migrations applied)
- AI Provider Factory (6 providers: Qwen, OpenAI, Anthropic, DeepSeek, Google, Groq)
- Agent CRUD (Server Actions + REST API + TanStack Query hooks + form UI)
- Conversation CRUD (auto-creation, title updates, message persistence)
- Chat (SSE streaming, tool execution, memory injection, markdown rendering)
- Tool System (BaseTool, ToolExecutor, WebSearch + Calculator, seeded in DB)
- Dashboard layout (sidebar, header, mobile nav, dark/light theme)
- Auth pages (glass-morphism with animated neural network background)
- Typography (Unbounded + DM Sans via next/font)

### Partially Implemented
- Memory System (~85%): Embeddings, similarity, MemoryManager CRUD/search/chat integration, memory management UI, conversation storage. Missing: pgvector migration
- Swarm Collaboration (~15%): Sequential engine exists, UI pages are placeholders
- Projects (~20%): Schema + empty pages, no CRUD logic
- Tasks/Kanban (~15%): Schema + empty pages, no board view
- Settings (~30%): Profile display + theme toggle, API keys page is empty

### Not Implemented
- Tests (Vitest + Playwright directories exist, no test files)
- Rate limiting (Upstash Redis configured in .env but not integrated)
- Search / Cmd+K (header search bar and CommandMenu component exist but are UI-only)
- Tool call visualization components (collapsible cards with execution status)
- Agent-to-agent chat

## Environment Variables
Required: `DATABASE_URL`, `AUTH_SECRET`, at least one AI provider API key.
Optional: OAuth keys (`AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`), `TAVILY_API_KEY` (web search), Redis URLs.
See `.env.example` for the full list.
