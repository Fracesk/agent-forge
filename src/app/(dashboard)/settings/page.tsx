"use client"

import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { User, Palette, Key, Sun, Moon, Loader2, Check, X, Edit2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [bio, setBio] = useState("")

  useEffect(() => setMounted(true), [])

  // Sync form fields when session loads
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session?.user?.name])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      })

      if (!res.ok) throw new Error("Failed to save")

      await update() // Refresh the session
      setEditing(false)
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setName(session?.user?.name || "")
    setBio("")
    setEditing(false)
  }

  return (
    <div>
      <PageHeader title="设置" description="管理账号和偏好" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">个人资料</h3>
                <p className="text-xs text-muted-foreground">你的个人信息</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Edit profile"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">名字</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">个人简介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="A short bio..."
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {saving ? "保存中..." : "保存"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{session?.user?.email || "Not signed in"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{session?.user?.name || "Not set"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Appearance Card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">外观</h3>
              <p className="text-xs text-muted-foreground">主题偏好</p>
            </div>
          </div>

          {mounted && (
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Sun className="h-4 w-4" />
                浅色
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-primary"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Moon className="h-4 w-4" />
                深色
              </button>
            </div>
          )}
        </div>

        {/* API Keys Card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">API 密钥</h3>
              <p className="text-xs text-muted-foreground">程序化访问</p>
            </div>
          </div>
          <Link
            href="/settings/api-keys"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Key className="h-4 w-4" />
            管理 API 密钥
          </Link>
        </div>
      </div>
    </div>
  )
}
