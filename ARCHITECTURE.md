# AgentForge Architecture

## 🎯 整体架构图（数据流视角）

```mermaid
flowchart TB
    %% ========== Client Layer ==========
    subgraph Client["🌐 前端 (Next.js 16 App Router)"]
        direction TB
        A1["Server Components<br/>(直接查询数据库)"]
        A2["Client Components<br/>(聊天/表单/列表)"]
        A3["Server Actions<br/>(增删改操作)"]
        A4["API Routes<br/>(REST + SSE)"]
    end

    subgraph State["📦 状态管理层"]
        B1["TanStack Query<br/>(服务端状态缓存)"]
        B2["Zustand<br/>(客户端状态)"]
        B3["nuqs<br/>(URL 参数)"]
    end

    subgraph Auth["🔐 认证层"]
        C1["NextAuth v5<br/>JWT + OAuth"]
        C2["Middleware<br/>路由保护"]
    end

    subgraph AI["🤖 AI 引擎层"]
        D1["Provider Factory<br/>6 个 AI 提供商"]
        D2["ToolExecutor<br/>工具执行引擎"]
        D3["MemoryManager<br/>语义记忆系统"]
    end

    subgraph Data["🗄️ 数据层"]
        E1["Prisma 7.8 ORM<br/>17 个数据模型"]
        E2["PostgreSQL 17<br/>+ pgvector"]
    end

    %% Connections
    A1 -->|"直接 Prisma 查询"| E1
    A2 -->|"数据获取"| B1
    A2 -->|"客户端状态"| B2
    A3 -->|"修改 + revalidatePath"| E1
    A4 -->|"REST JSON"| E1
    A4 -->|"SSE 流式"| A2
    
    A2 -->|"登录/注册"| C1
    C1 -->|"Session"| C2
    
    A4 -->|"streamText()"| D1
    D1 -->|"Qwen/OpenAI/Anthropic/..."| AI
    A4 -->|"注册工具"| D2
    D2 -->|"WebSearch / Calculator"| A4
    A4 -->|"检索记忆"| D3
    D3 -->|"嵌入向量"| E2
```

## 🔄 聊天流程（核心链路）

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as ChatUI
    participant API as Chat API Route
    participant AI as AI SDK
    participant Tool as ToolExecutor
    participant Mem as MemoryManager
    participant DB as PostgreSQL

    User->>UI: 输入消息
    UI->>UI: useChatStream.sendMessage()
    UI->>UI: 添加用户消息到列表
    UI->>UI: 创建空助手消息占位
    
    UI->>API: POST /api/agents/[id]/chat
    Note over UI,API: SSE 连接建立
    
    API->>DB: 查询 Agent + Tools
    API->>DB: 创建/查询 Conversation
    API->>DB: 保存用户消息
    
    API->>Mem: 检索相关记忆
    Mem->>DB: 查询嵌入向量
    Mem-->>API: 返回相关上下文
    API->>API: 注入记忆到 system prompt
    
    API->>AI: streamText(model, system, tools)
    
    AI-->>API: textStream 开始
    
    alt 模型调用工具
        AI->>Tool: 执行 web_search/calculator
        Tool-->>AI: 返回结果
        API->>UI: SSE: tool_start
        API->>UI: SSE: tool_end (含结果)
    end
    
    loop 逐块流式返回
        AI-->>API: text chunk
        API->>UI: SSE: { type:"text", delta }
        UI->>UI: 追加到消息内容
    end
    
    API->>DB: 保存完整助手消息
    API->>UI: SSE: [DONE]
    UI->>UI: 流结束，调用 onFinish
```

## 📁 目录结构（按功能划分）

```mermaid
graph LR
    subgraph pages["📄 页面"]
        Login["/login<br/>登录"]
        Register["/register<br/>注册"]
        Agents["/agents<br/>代理列表"]
        AgentNew["/agents/new<br/>创建代理"]
        AgentChat["/agents/[id]/chat<br/>聊天"]
        AgentMemory["/agents/[id]/memory<br/>记忆"]
        Convos["/conversations<br/>对话历史"]
        Settings["/settings<br/>设置"]
    end

    subgraph components["🧩 组件"]
        ChatW["ChatWindow<br/>聊天窗口"]
        ChatM["ChatMessages<br/>消息列表"]
        ChatMsg["ChatMessage<br/>单条消息"]
        ChatI["ChatInput<br/>输入框"]
        ToolC["ToolCallCard<br/>工具调用卡片"]
        CmdK["CommandMenu<br/>⌘K 搜索"]
        Side["AppSidebar<br/>侧边栏"]
        Header["Header<br/>頂部栏"]
    end

    subgraph hooks["🪝 Hooks"]
        H1["useChatStream<br/>SSE 流式聊天"]
        H2["useAgents<br/>代理 CRUD"]
        H3["useConversations<br/>对话 CRUD"]
        H4["useAgentMemory<br/>记忆 CRUD"]
    end

    subgraph lib["🔧 核心逻辑"]
        L1["auth.ts<br/>NextAuth 配置"]
        L2["prisma.ts<br/>数据库客户端"]
        L3["provider-factory.ts<br/>AI 模型工厂"]
        L4["ToolExecutor<br/>工具执行器"]
        L5["MemoryManager<br/>记忆管理器"]
        L6["embedding.ts<br/>文本嵌入"]
        L7["similarity.ts<br/>相似度计算"]
    end

    pages --> components
    components --> hooks
    hooks --> lib
```

## 🏗️ 17 个数据模型关系

```mermaid
erDiagram
    User ||--o{ Agent : "创建"
    User ||--o{ Conversation : "拥有"
    User ||--o{ Project : "创建"
    User ||--o{ ApiKey : "拥有"
    
    Agent ||--o{ AgentTool : "配置"
    Agent ||--o{ AgentMemory : "拥有"
    Agent ||--o{ AgentCollaborationAgent : "参与"
    Tool ||--o{ AgentTool : "被引用"
    
    Conversation ||--o{ Message : "包含"
    Conversation }o--|| Agent : "关联"
    Conversation }o--|| Project : "可选关联"
    
    Project ||--o{ Task : "包含"
    Task ||--o{ TaskDependency : "依赖"

    AgentCollaboration ||--o{ AgentCollaborationAgent : "包含"
```

## 💡 关键设计决策

### 为什么用 SSE 而不是 WebSocket？
聊天是单向流（服务端→客户端），SSE 原生支持、浏览器自动重连、与 HTTP 兼容。不需要 WebSocket 的双向开销。

### 为什么用 ref 解决陈旧闭包？
`useChatStream` 的 `sendMessage` 在 `useCallback` 中捕获 `messages`。如果用 `messages` 做依赖，每次流式更新都会重建函数。用 `useRef` 保持最新引用，避免这个问题。

### 工具执行为什么在路由层包装 SSE？
Vercel AI SDK 的 `streamText` 执行工具时，前端看不到中间状态。通过在 `execute` 函数里手动写 `writer.write()` 发送 `tool_start/tool_end` 事件，前端能实时看到工具执行进度。

### Provider Factory 怎么工作？
```typescript
getModel("qwen:qwen3.7-max")
// → createOpenAI({ baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1" })

getModel("openai:gpt-4o")
// → createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

getModel("anthropic:claude-sonnet-4-6")
// → createAnthropic()
```
统一的 `provider:model-id` 字符串，路由层不需要知道具体用哪个厂商。

---

> 这张图对应项目路径 `D:\Desktop\ReactByVibeCoding\agent-forge\`
