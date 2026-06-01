# 部署指南

## 方案：Vercel + Neon（免费）

### 1. 创建 PostgreSQL 数据库

1. 打开 https://console.neon.tech/ → 注册/登录
2. 创建项目 → 区域选 **Singapore**（国内访问快）
3. 创建后复制 **连接字符串**（以 `postgresql://` 开头）

### 2. 部署到 Vercel

1. 打开 https://vercel.com/new
2. 导入 `Fracesk/agent-forge` 仓库
3. 在环境变量配置页填入：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | 刚才从 Neon 复制的连接字符串 |
| `AUTH_SECRET` | 随机字符串（用 `openssl rand -base64 32` 生成） |
| `AUTH_URL` | `https://你的项目名.vercel.app`（不确定就先留着） |
| `QWEN_API_KEY` | 你的通义千问 API Key |
| `DEFAULT_MODEL` | `qwen:qwen3.7-max` |

4. 点击 **Deploy**
5. 部署完成后 Vercel 会给你一个 URL，形如 `https://agent-forge-xxx.vercel.app`

### 3. 部署后

1. 运行数据库迁移：
```bash
# 在 Vercel 项目页进入 Terminal 或本地跑
DATABASE_URL="你的Neon连接串" pnpm prisma migrate deploy
```

2. 打开 URL，注册账号，测试功能

### 4. 更新 README

部署成功后把 README 里的 demo URL 替换成你的 Vercel URL：

- `ARCHITECTURE.md` 里的 `AUTH_URL` 示例
- 项目顶部的描述

---

## 替代方案：Railway（一键部署）

1. 打开 https://railway.app/new
2. 选 **Deploy from GitHub repo** → 选 `agent-forge`
3. Railway 会自动检测 Next.js + PostgreSQL
4. 填入同样的环境变量
5. 部署完成即获得 URL
