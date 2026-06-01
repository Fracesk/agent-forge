"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

async function fetchAgents() {
  const res = await fetch("/api/agents")
  if (!res.ok) throw new Error("Failed to fetch agents")
  return res.json()
}

async function fetchAgent(id: string) {
  const res = await fetch(`/api/agents/${id}`)
  if (!res.ok) throw new Error("Failed to fetch agent")
  return res.json()
}

async function fetchTools() {
  const res = await fetch("/api/tools")
  if (!res.ok) throw new Error("Failed to fetch tools")
  return res.json()
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  })
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => fetchAgent(id),
    enabled: !!id,
  })
}

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: fetchTools,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description?: string
      systemPrompt: string
      model: string
      temperature: number
      maxTokens: number
      toolIds?: string[]
    }) => {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create agent")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      router.push("/agents")
      router.refresh()
    },
  })
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<{
      name: string
      description: string
      systemPrompt: string
      model: string
      temperature: number
      maxTokens: number
      toolIds: string[]
    }>) => {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update agent")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      queryClient.invalidateQueries({ queryKey: ["agent", id] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete agent")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      router.push("/agents")
      router.refresh()
    },
  })
}
