"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useEffect, useState, useRef, useCallback } from "react"
import { Sun, Moon, LogOut, Menu, Command } from "lucide-react"
import { CommandMenu } from "./command-menu"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Global keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandMenuOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const toggleCommandMenu = useCallback(() => {
    setCommandMenuOpen((prev) => !prev)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [userMenuOpen])

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={toggleCommandMenu}
          className="relative hidden md:flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-all duration-200 w-64 hover:bg-muted hover:text-foreground"
        >
          <Command className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">搜索代理、对话...</span>
          <kbd className="ml-auto hidden rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <CommandMenu open={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />

      {/* Right: Theme + User */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 transition-all hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 transition-all hover:-rotate-12" />
            )}
          </button>
        )}

        {/* User menu */}
        {session?.user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground shadow-sm">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight">{session.user.name}</p>
                <p className="text-[11px] text-muted-foreground">{session.user.email}</p>
              </div>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1">
                <div className="border-b bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { signOut({ callbackUrl: "/login" }); setUserMenuOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
