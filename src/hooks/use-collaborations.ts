"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

async function fetchCollaborations() {
  const res = await fetch("/api/collaborations")
  if (!res.ok) throw new Error("Failed to fetch collaborations")
  return res.json()
}

async function fetchCollaboration(id: string) {
  const res = await fetch(`/api/collaborations/${id}`)
  if (!res.ok) throw new Error("Failed to fetch collaboration")
  return res.json()
}

async function createCollaboration(data: {
  name: string
  description?: string
  agentIds: string[]
  strategy?: string
  maxRounds?: number
  config?: Record<string, unknown>
}) {
  const res = await fetch("/api/collaborations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create collaboration")
  return res.json()
}

async function runCollaboration(id: string) {
  const res = await fetch(`/api/collaborations/${id}/run`, {
    method: "POST",
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to run collaboration")
  }
  return res.json()
}

async function deleteCollaboration(id: string) {
  const res = await fetch(`/api/collaborations/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete collaboration")
}

export function useCollaborations() {
  return useQuery({
    queryKey: ["collaborations"],
    queryFn: fetchCollaborations,
  })
}

export function useCollaboration(id: string) {
  return useQuery({
    queryKey: ["collaboration", id],
    queryFn: () => fetchCollaboration(id),
    enabled: !!id,
  })
}

export function useCreateCollaboration() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: createCollaboration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] })
      router.push(`/collaborations/${data.collaboration.id}`)
    },
  })
}

export function useRunCollaboration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: runCollaboration,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration", id] })
      queryClient.invalidateQueries({ queryKey: ["collaborations"] })
    },
  })
}

export function useDeleteCollaboration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCollaboration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] })
    },
  })
}
