"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  MessageSquare,
  Plus,
  Moon,
  Sun,
  Search,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface CommandMenuProps {
  open: boolean
  onClose: () => void
}

interface SearchItem {
  id: string
  label: string
  subtitle?: string
  type: "agent" | "conversation" | "action"
  href: string
  icon: React.ReactNode
}

export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const [agents, setAgents] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch agents for search
  useEffect(() => {
    if (!open || search.length < 1) {
      setAgents([])
      return
    }

    const controller = new AbortController()
    setLoading(true)

    fetch(`/api/agents?search=${encodeURIComponent(search)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        const items: SearchItem[] = (data || [])
          .filter((a: any) => a.name)
          .map((a: any) => ({
            id: a.id,
            label: a.name,
            subtitle: a.model || "AI Agent",
            type: "agent" as const,
            href: `/agents/${a.id}`,
            icon: <Bot className="h-4 w-4" />,
          }))
        setAgents(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [open, search])

  const runAction = useCallback(
    (item: SearchItem) => {
      onClose()
      if (item.type === "action") {
        if (item.id === "new-agent") {
          router.push("/agents/new")
        } else if (item.id === "toggle-theme") {
          setTheme(theme === "dark" ? "light" : "dark")
        }
      } else {
        router.push(item.href)
      }
    },
    [onClose, router, theme, setTheme]
  )

  const actions: SearchItem[] = [
    {
      id: "new-agent",
      label: "New Agent",
      subtitle: "Create a new AI agent",
      type: "action",
      href: "/agents/new",
      icon: <Plus className="h-4 w-4" />,
    },
    {
      id: "toggle-theme",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      subtitle: "Toggle theme",
      type: "action",
      href: "#",
      icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
    },
  ]

  const allItems = search
    ? [...agents]
    : [
        {
          id: "agents",
          label: "Agents",
          subtitle: "View all agents",
          type: "action" as const,
          href: "/agents",
          icon: <Bot className="h-4 w-4" />,
        },
        {
          id: "conversations",
          label: "Conversations",
          subtitle: "View all conversations",
          type: "action" as const,
          href: "/conversations",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        ...actions,
      ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-1/2 top-[12%] w-full max-w-lg -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border bg-popover shadow-2xl shadow-black/10">
              <Command
                label="Command Menu"
                shouldFilter={false}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground/60 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4"
              >
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search agents, conversations..."
                    className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  />
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                  )}
                </div>

                <Command.List className="max-h-72 overflow-y-auto p-2">
                  <Command.Empty className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
                    <Search className="h-8 w-8 text-muted-foreground/30" />
                    <span>No results found</span>
                  </Command.Empty>

                  {search && agents.length > 0 && (
                    <Command.Group heading="Agents">
                      {agents.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => runAction(item)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-accent"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                            {item.icon}
                          </span>
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">{item.label}</p>
                            {item.subtitle && (
                              <p className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}

                  <Command.Group heading={search ? "Actions" : "Quick Actions"}>
                    {allItems.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => runAction(item)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-accent"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          {item.icon}
                        </span>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate font-medium">{item.label}</p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <kbd className="hidden rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
                          ↵
                        </kbd>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {!search && (
                    <Command.Group heading="Tips">
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground/60">
                          Type to search agents and conversations · <kbd className="rounded border bg-muted/50 px-1 font-medium">↑↓</kbd> navigate · <kbd className="rounded border bg-muted/50 px-1 font-medium">esc</kbd> close
                        </p>
                      </div>
                    </Command.Group>
                  )}
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
