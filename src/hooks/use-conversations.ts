"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export interface Message {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  agentId?: string
  agentName?: string
  toolCalls?: any
  createdAt: string
}

async function fetchConversations() {
  const res = await fetch("/api/conversations")
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

async function fetchConversation(id: string) {
  const res = await fetch(`/api/conversations/${id}`)
  if (!res.ok) throw new Error("Failed to fetch conversation")
  return res.json()
}

async function fetchConversationMessages(id: string) {
  const res = await fetch(`/api/conversations/${id}/messages`)
  if (!res.ok) throw new Error("Failed to fetch messages")
  return res.json()
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  })
}

export function useConversationMessages(id: string) {
  return useQuery({
    queryKey: ["conversation-messages", id],
    queryFn: () => fetchConversationMessages(id),
    enabled: !!id,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: { agentId: string; title?: string }) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create conversation")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      router.push(`/conversations/${data.conversation.id}`)
      router.refresh()
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete conversation")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}
