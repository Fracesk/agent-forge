<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/AgentForge-0A0A1A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgc3Ryb2tlPSIjNjM2NkYxIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTIgMjBsNC0yIDQgMi00IDJ6IiBmaWxsPSIjNjM2NkYxIi8+PC9zdmc+" />
    <img alt="AgentForge" src="https://img.shields.io/badge/AgentForge-0A0A1A?style=for-the-badge" />
  </picture>
</p>

<p align="center">
  <strong>A production-grade AI agent collaboration platform with multi-provider support, real-time streaming chat, semantic memory, and extensible tool execution.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&style=flat-square" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-58C4DC?logo=react&style=flat-square" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=flat-square" alt="TypeScript 5" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&style=flat-square" alt="Tailwind CSS v4" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&style=flat-square" alt="Prisma 7" /></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&style=flat-square" alt="PostgreSQL 17" /></a>
  <a href="https://authjs.dev"><img src="https://img.shields.io/badge/NextAuth-v5-000000?logo=auth0&style=flat-square" alt="NextAuth v5" /></a>
  <br />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://github.com/features/copilot"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" /></a>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Multi-Provider AI** | 6 providers — Qwen (DashScope), OpenAI, Anthropic, DeepSeek, Google (Gemini), Groq |
| ⚡ **Real-Time Streaming** | SSE-based chat with typewriter effect, abort support, and tool call visualization |
| 🧠 **Semantic Memory** | Embedding-based retrieval (text-embedding-v3) with automatic conversation persistence |
| 🔧 **Extensible Tool System** | `BaseTool` abstraction, `ToolExecutor` engine with 30s timeout, WebSearch + Calculator built-in |
| 🎨 **Dark & Light Mode** | Full Oklch color space theming via `next-themes`, persisted preference |
| 📱 **Responsive Design** | Collapsible sidebar, mobile drawer navigation, adaptive layouts |
| 🔐 **Authentication** | NextAuth v5 with Credentials (bcrypt), GitHub OAuth, and Google OAuth |
| 🗄️ **PostgreSQL + Prisma** | 17 models with full migrations, pgvector-ready for vector search |

---

## 🖼️ Screenshots

> *(Coming soon — add screenshots of the dashboard, chat interface, agent creation, and memory browser)*

| | | |
|:---:|:---:|:---:|
| Dashboard | Chat Interface | Agent Builder |
| Memory Browser | Conversation List | Settings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Next.js 16)                          │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────────┐ │
│  │ Server   │  │ Client   │  │ Server  │  │ API Routes           │ │
│  │Comp.     │  │ Comp.    │  │ Actions │  │ (REST + SSE)         │ │
│  └──────────┘  └──────────┘  └─────────┘  └──────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                         App Layer                                    │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ NextAuth v5  │  │ Vercel AI SDK v6  │  │ ToolExecutor         │  │
│  │ (JWT + OAuth)│  │ streamText()      │  │ (BaseTool registry)  │  │
│  └──────────────┘  └──────────────────┘  └──────────────────────┘  │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐  │
│  │ MemoryManager    │  │ Provider Factory                       │  │
│  │ (embeddings +    │  │ (Qwen / OpenAI / Anthropic / Google    │  │
│  │  cosine sim.)    │  │  / DeepSeek / Groq)                    │  │
│  └──────────────────┘  └────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      Data Layer                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Prisma 7.8 ORM  →  PostgreSQL 17 + pgvector                   │ │
│  │  17 models: User, Agent, Conversation, Message, AgentMemory,   │ │
│  │  Tool, Project, Task, AgentCollaboration, ...                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion) |
| **Database** | [PostgreSQL 17](https://www.postgresql.org) + [pgvector](https://github.com/pgvector/pgvector) |
| **ORM** | [Prisma 7.8](https://www.prisma.io) (`@prisma/adapter-pg`) |
| **Auth** | [NextAuth v5](https://authjs.dev) (JWT + PrismaAdapter) |
| **AI SDK** | [Vercel AI SDK v6](https://sdk.vercel.ai) + 6 provider adapters |
| **State (Server)** | [TanStack Query v5](https://tanstack.com/query) |
| **State (Client)** | [Zustand v5](https://zustand-demo.pmnd.rs) |
| **Validation** | [Zod v4](https://zod.dev) |
| **Testing** | [Vitest v4](https://vitest.dev), [Playwright v1.60](https://playwright.dev) |
| **Dev Tools** | ESLint, Prettier, TypeScript strict mode |

---

## 📁 Project Structure

```
agent-forge/
├── prisma/
│   ├── schema.prisma          # 17 database models
│   ├── seed.ts                # Seed data (built-in tools)
│   └── migrations/            # Database migrations
├── src/
│   ├── actions/               # Server Actions (mutations + revalidation)
│   ├── app/
│   │   ├── (auth)/            # Login, Register (animated background)
│   │   ├── (dashboard)/       # Agents, Conversations, Projects, Tasks, Settings
│   │   └── api/               # REST endpoints + SSE streaming
│   ├── components/
│   │   ├── agents/            # AgentCard, AgentForm, MemoryCard
│   │   ├── chat/              # ChatWindow, ChatMessage, ChatInput, ToolCallCard
│   │   ├── layout/            # AppSidebar, Header, MobileNav
│   │   └── shared/            # PageHeader, EmptyState, ComingSoon
│   ├── hooks/                 # Custom React hooks (TanStack Query wrappers)
│   ├── lib/
│   │   ├── ai/                # Provider factory (6 providers)
│   │   ├── agents/
│   │   │   ├── tools/         # BaseTool, ToolExecutor, WebSearchTool, CalculatorTool
│   │   │   └── memory/        # MemoryManager, embeddings, similarity
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── prisma.ts          # Prisma client singleton
│   └── providers/             # SessionProvider, ThemeProvider, QueryProvider
├── tests/                     # Unit tests (Vitest) + E2E tests (Playwright)
├── docker-compose.yml         # PostgreSQL + pgvector
└── vitest.config.ts           # Vitest configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker Desktop** (for PostgreSQL)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/agent-forge.git
cd agent-forge

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and one AI provider API key

# 4. Start PostgreSQL
docker compose up -d

# 5. Run database migrations
pnpm prisma migrate dev

# 6. Seed built-in tools
pnpm prisma db seed

# 7. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start creating agents.

### Environment Variables

See [.env.example](.env.example) for the full list. Required variables:

```bash
DATABASE_URL="postgresql://agentforge:agentforge_secret@localhost:5432/agentforge"
AUTH_SECRET="your-secret-at-least-32-chars"
# At least one AI provider:
QWEN_API_KEY="sk-..."      # Recommended (default)
# or
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm vitest` | Run unit tests (Vitest, watch mode) |
| `pnpm test:run` | Run unit tests (single run) |
| `pnpm playwright` | Run E2E tests (Playwright) |
| `pnpm prisma studio` | Open database GUI |
| `pnpm prisma migrate dev` | Apply pending migrations |

---

## 📡 API Overview

All API routes are prefixed with `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/[...nextauth]` | NextAuth authentication |
| `GET/POST` | `/api/agents` | List / create agents |
| `GET/PATCH/DELETE` | `/api/agents/[id]` | Agent CRUD |
| `POST` | `/api/agents/[id]/chat` | SSE streaming chat |
| `GET/POST` | `/api/agents/[id]/memory` | Memory CRUD |
| `POST` | `/api/agents/[id]/memory/search` | Semantic memory search |
| `GET/POST` | `/api/conversations` | List / create conversations |
| `GET` | `/api/conversations/[id]/messages` | Get conversation messages |
| `GET` | `/api/tools` | List available tools |

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test:run

# Run tests in watch mode during development
pnpm vitest

# Run E2E tests
pnpm playwright

# Open Playwright UI
pnpm playwright --ui
```

---

## 🐳 Deployment

### Docker (Production)

A multi-stage Dockerfile and docker-compose configuration are included:

```bash
# Build and run with PostgreSQL
docker compose up -d
```

The Dockerfile uses:
1. **Deps stage** — installs production dependencies
2. **Build stage** — creates optimized production build
3. **Runner stage** — serves via Node.js (standalone output)

---

## 🗺️ Roadmap

- [x] Authentication (Credentials + OAuth)
- [x] Agent CRUD + Tool configuration
- [x] SSE streaming chat with memory
- [x] Semantic memory system
- [ ] **Multi-agent collaboration (Swarm)** — delegating tasks between agents
- [ ] **Project management** — Kanban board for tasks
- [ ] **Agent-to-agent chat** — collaboration conversations
- [ ] **Rate limiting** — Upstash Redis integration
- [ ] **Tool call visualizations** — collapsible cards with execution status
- [ ] **Search / Cmd+K** — global command palette

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a> · <a href="https://react.dev">React</a> · <a href="https://tailwindcss.com">Tailwind CSS</a> · <a href="https://www.postgresql.org">PostgreSQL</a>
</p>
