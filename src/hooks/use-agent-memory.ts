"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export interface AgentMemory {
  id: string
  type: string
  content: string
  summary: string | null
  metadata: any
  importance: number
  agentId: string
  userId: string | null
  createdAt: string
  lastAccessedAt: string
}

interface CreateMemoryParams {
  type: string
  content: string
  summary?: string
  importance?: number
}

interface SearchParams {
  query: string
  limit?: number
  minScore?: number
  types?: string[]
}

export function useAgentMemories(agentId: string, type?: string) {
  const params = new URLSearchParams()
  if (type) params.set("type", type)
  params.set("limit", "100")

  return useQuery({
    queryKey: ["agent-memories", agentId, type],
    queryFn: async () => {
      const res = await fetch(`/api/agents/${agentId}/memory?${params}`)
      if (!res.ok) throw new Error("Failed to fetch memories")
      return res.json() as Promise<{ memories: AgentMemory[]; total: number }>
    },
    enabled: !!agentId,
  })
}

export function useMemorySearch(agentId: string) {
  return useMutation({
    mutationFn: async (params: SearchParams) => {
      const res = await fetch(`/api/agents/${agentId}/memory/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error("Search failed")
      return res.json() as Promise<{ results: Array<{ memory: AgentMemory; score: number }> }>
    },
  })
}

export function useCreateMemory(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateMemoryParams) => {
      const res = await fetch(`/api/agents/${agentId}/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error("Failed to create memory")
      return res.json() as Promise<AgentMemory>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-memories", agentId] })
    },
  })
}

export function useDeleteMemory(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memoryId: string) => {
      const res = await fetch(`/api/agents/${agentId}/memory/${memoryId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete memory")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-memories", agentId] })
    },
  })
}

export function useUpdateMemory(agentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      memoryId,
      ...data
    }: { memoryId: string } & Partial<CreateMemoryParams>) => {
      const res = await fetch(`/api/agents/${agentId}/memory/${memoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update memory")
      return res.json() as Promise<AgentMemory>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-memories", agentId] })
    },
  })
}
