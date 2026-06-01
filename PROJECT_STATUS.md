# AgentForge — 项目功能实现状态

> 最后更新: 2026-05-31
> 框架: Next.js 16.2.6 / React 19.2 / PostgreSQL 17 / Prisma 7.8

---

## 整体进度: ~70%

| 层级 | 完成度 | 状态 |
|------|--------|------|
| 数据库 | 95% | 模式/迁移/种子数据完整 |
| 认证系统 | 90% | 登录/注册/中间件/OAuth 配置完整 |
| AI Provider | 85% | 6 个 provider 已配置，Qwen 已验证可用 |
| Agent 系统 | 85% | CRUD 完整，UI 全面 |
| Chat 系统 | 85% | 流式/持久化/对话管理/工具调用/Memory 集成均正常 |
| Tool 系统 | 80% | 抽象/2工具/执行器/种子数据完整 |
| Dashboard UI | 95% | 侧边栏/Header/主题/状态覆盖完整 |
| **Memory 系统** | **85%** | **核心库+API+Chat集成+UI 已完成** |
| 其他页面 | 30% | Projects/Tasks/Collaborations 仅空状态 |
| API 路由 | 75% | 11/15 路由已实现 |
| 测试 | 0% | 无测试文件 |

---

## ✅ 已实现

### 1. 数据库
- 17 个 Prisma 模型全部创建 (User, Agent, Tool, Conversation, Message, Task, Project, AgentCollaboration, AgentMemory 等)
- 索引、外键、约束齐全
- PostgreSQL 17 Windows 本地服务运行中
- 种子数据: web_search + calculator 已填充并关联到 Agent

### 2. 认证
- 登录/注册页面 (玻璃拟态 + 动态粒子背景)
- 中间件路由保护 (cookie-based session 检测)
- Credentials + GitHub + Google OAuth 配置
- bcrypt 密码加密, JWT Session 策略

### 3. AI Provider
- 6 个 Provider 注册: Qwen / OpenAI / Anthropic / DeepSeek / Google / Groq
- `provider:model` 格式的模型字符串解析
- Qwen (DashScope 国内端点 `dashscope.aliyuncs.com`) 已验证可用
- `.chat()` 模式适配 DashScope (非 Responses API)

### 4. Agent 系统
- Server Actions: createAgent / updateAgent / deleteAgent / toggleAgentTool / duplicateAgent
- API Routes: GET/POST/PATCH/DELETE 完整 CRUD
- React Query Hooks: useAgents / useAgent / useTools / useCreateAgent / useUpdateAgent / useDeleteAgent
- UI: AgentCard (状态指示/模型徽章/统计/操作菜单) + AgentForm (名称/提示词/模型配置/工具选择)
- 页面: 列表 / 创建 / 详情 / Chat / Settings(占位)

### 5. Chat 系统
- SSE 流式对话端点 `POST /api/agents/[id]/chat`
- 用户消息 → 响应前持久化, 助手消息 → 流完成后持久化
- 对话自动创建 + 标题更新
- 动态工具加载: DB 中 Agent.tools → toolImplementations 映射 → Zod schema
- 前端: ChatWindow / ChatMessages / ChatMessage (Markdown + 复制) / ChatInput (自动调整/Shift+Enter/发送停止)
- useChatStream hook (AbortController / SSE 解析 / 消息状态管理)
- ConversationList (按 Agent 筛选/删除/事件刷新)
- 端到端验证通过 (含工具调用)

### 6. Tool 系统
- BaseTool 抽象类 (name/description/parameters/execute/toFunctionDefinition)
- WebSearchTool: Tavily API + DuckDuckGo 回退
- CalculatorTool: mathjs 沙盒执行
- ToolExecutor: 注册/执行/超时(30s)/时长追踪
- 种子数据 upsert 到 Tool 表 → AgentTool 关联

### 7. Dashboard UI
- AppSidebar: 6 导航项 + 激活态 + 折叠模式
- Header: 搜索栏(占位) + 主题切换 + 用户菜单
- MobileNav: 滑入抽屉
- 亮/暗模式 (next-themes + Oklch CSS 变量)
- 字体: Unbounded (显示) + DM Sans (正文)
- 共享组件: PageHeader / EmptyState
- 加载态/错误态/空态覆盖

### 8. 已修复
- ❌ `message.tsx`: `role` 类型修复 (`"tool"` 添加)
- ❌ `conversation-list.tsx`: `<button>` 嵌套 `<button>` hydration 错误修复
- ❌ `provider-factory.ts`: Qwen 端点从 `dashscope-intl` 改为 `dashscope` (国内)
- ❌ `provider-factory.ts`: 添加 `.chat()` 方法避免 Responses API 不兼容
- ❌ `provider-factory.ts`: 添加 ANTHROPIC_AUTH_TOKEN 回退 + baseURL 支持

---

## 🔶 部分实现

### 1. Memory 系统 — 85%
- [模型] ✅ AgentMemory 表: id/type/content/summary/metadata/embedding/importance/agentId/userId
- [嵌入] ✅ 应用层 cosine similarity 向量检索 (无 pgvector, JSON String 存储)
- [嵌入] ✅ Qwen DashScope text-embedding-v3 生成 (带缓存+降级到关键词)
- [运行时] ✅ MemoryManager 类: CRUD / search / importance / consolidate / chat integration
- [API] ✅ POST/GET /api/agents/[id]/memory (列表+创建)
- [API] ✅ GET/PATCH/DELETE /api/agents/[id]/memory/[memoryId] (单条CRUD)
- [API] ✅ POST /api/agents/[id]/memory/search (语义搜索)
- [Chat] ✅ 上下文注入: 检索相关记忆 → 附加到 system prompt
- [Chat] ✅ 对话存储: 流完成后自动保存为 episodic memory
- [UI] ✅ 记忆管理页面: 列表/类型筛选/语义搜索/删除
- [UI] ✅ MemoryCard: 类型徽章/内容截断/展开/复制/删除/重要性进度条
- [UI] ✅ Agent 详情页添加 Memory 导航按钮
- [待优化] ❌ 无 pgvector (当记忆量>5000条时需优化)

### 2. Projects — 20%
- [页面] ✅ 列表页 (空状态) / 新建页 (占位符) / 详情页 (占位符)
- [API] ❌ 无 API 路由
- [Action] ❌ 无 Server Actions
- [Hook] ❌ 无 React Query hooks

### 3. Collaborations (Swarm) — 15%
- [模型] ✅ AgentCollaboration + AgentCollaborationAgent 表存在
- [页面] ✅ 列表页 / 新建页 / 详情页 (均为占位符)
- [运行时] ❌ 无协作编排引擎
- [API] ❌ 无 API 路由

### 4. Tasks (Kanban) — 15%
- [模型] ✅ Task + TaskDependency 表存在
- [页面] ✅ 列表页 / 详情页 (占位符)
- [API] ❌ 无 API 路由
- [UI] ❌ 无看板视图

### 5. Settings — 30%
- [页面] ✅ Profile 卡片 (显示姓名/邮箱) + 外观 (主题) + API Keys 链接
- [API Keys] ❌ 空状态, 无创建/删除/撤销

---

## ❌ 未实现

### 1. 测试体系 — 0%
- Vitest: 目录存在, 无测试文件
- Playwright: 目录存在, 无测试文件

### 2. 速率限制 — 0%
- Upstash Redis 配置在 .env 中但未集成

### 3. 搜索功能 — 0%
- Header 搜索栏 UI 存在但无功能 (nuqs 已安装未使用)

### 4. Tool Call UI 组件 — 0%
- 无折叠卡片/状态指示器/工具调用可视化

---

## 已知问题

| # | 问题 | 严重程度 | 位置 |
|---|------|---------|------|
| 1 | `QWEN_API_KEY` 明文硬编码在 `.env` | 安全 | `.env:18` |
| 2 | `useChatStream` 闭包捕获 `messages` 为依赖, 可能陈旧闭包 | 潜在 Bug | `use-chat-stream.ts` |
| 3 | Chat 路由用静态 `toolImplementations` 而非 `ToolExecutor` | 架构 | `chat/route.ts:11` |
| 4 | `ConversationDetailPage` 通过消息查找 agentId, 脆弱 | 潜在 Bug | `conversations/[id]/page.tsx` |
| 5 | 无 git 提交历史 (仅 1 次初始提交) | 流程 | - |
| 6 | Search bar + CmdK 仅为 UI 占位 | 功能缺失 | `header.tsx` |
| 7 | Memory 系统嵌入向量存 JSON String, 全量加载后内存计算 O(n) | 性能 | `similarity.ts` |
| 8 | 记忆管理页面 Delete 按钮需 hover 才显示 (opacity-0) | UX | `memory-card.tsx` |
