"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Bot,
  MessageSquare,
  Projector,
  CheckSquare,
  GitBranch,
  Settings,
  Sparkles,
  ChevronLeft,
  PanelRightClose,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { title: "代理", href: "/agents", icon: Bot },
  { title: "对话", href: "/conversations", icon: MessageSquare },
  { title: "协作", href: "/collaborations", icon: GitBranch },
  { title: "项目", href: "/projects", icon: Projector },
  { title: "任务", href: "/tasks", icon: CheckSquare },
  { title: "设置", href: "/settings", icon: Settings },
]

interface AppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  onClose?: () => void
}

export function AppSidebar({ collapsed = false, onToggle, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border/50 px-4">
        <Link href="/agents" onClick={onClose} className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
          </div>
          <div className={cn("transition-opacity duration-300", collapsed && "opacity-0")}>
            <span className="text-base font-bold tracking-tight">AgentForge</span>
            <p className="text-[10px] leading-tight text-muted-foreground">AI 平台</p>
          </div>
        </Link>

        {!collapsed && onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title="Collapse sidebar"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-transparent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform", isActive && "scale-110")} />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse button for collapsed state */}
      {collapsed && onToggle && (
        <div className="border-t border-sidebar-border/50 p-3">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            title="Expand sidebar"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-sidebar to-transparent" />
    </aside>
  )
}
