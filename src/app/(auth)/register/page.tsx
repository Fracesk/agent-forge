"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Bot, ArrowRight, Mail, User, Lock } from "lucide-react"

function FloatingInput({
  id, label, type, value, onChange, icon: Icon, ...props
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; icon?: React.ElementType;
  [key: string]: any
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isUp = focused || hasValue

  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300"
          style={{ color: focused ? "rgba(129, 140, 248, 0.7)" : "rgba(255,255,255,0.2)" }}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-white
          placeholder:text-transparent
          transition-all duration-300 ease-out
          focus-visible:outline-none
          ${Icon ? "pl-11" : "pl-4"}
          ${focused ? "border-amber-400/50 bg-white/[0.05] shadow-[0_0_20px_rgba(99,102,241,0.08)]" : "border-white/10"}
          hover:border-white/20
        `}
        {...props}
      />
      <label
        htmlFor={id}
        style={{ left: Icon ? 44 : 16 }}
        className={`absolute top-3.5 text-sm transition-all duration-300 ease-out pointer-events-none select-none cursor-text
          ${isUp ? "text-[10px] -translate-y-4 text-amber-300/70" : "text-white/30 translate-y-0"}
        `}
        onClick={() => document.getElementById(id)?.focus()}
      >
        {label}
      </label>
      <div className={`
        absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-amber-400 to-violet-400
        transition-all duration-500 ease-out pointer-events-none
        ${focused ? "opacity-60 scale-x-100" : "opacity-0 scale-x-0"}
      `} />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "注册失败")
        return
      }

      const result = await signIn("credentials", { email, password, redirect: false })

      if (result?.ok) {
        router.push("/agents")
        router.refresh()
      }
    } catch {
      setError("出了点问题，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-[420px]" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease-out" }}>
        {/* Header */}
        <div className="mb-10 text-center" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity 0.7s ease-out, transform 0.7s ease-out" }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 animate-[logoReveal_0.8s_ease-out_both]">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90 font-display">创建账号</h1>
          <p className="mt-2 text-sm text-white/40 font-light tracking-wide">开启你的 AI 协作之旅</p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 shadow-2xl backdrop-blur-2xl"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(30px)",
            transition: "opacity 0.8s ease-out 0.15s, transform 0.8s ease-out 0.15s",
          }}
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700" style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.1), rgba(6,182,212,0.2), rgba(99,102,241,0.3))",
            backgroundSize: "300% 300%",
            animation: "borderGlow 4s ease-in-out infinite",
          }} />

          {error && (
            <div className="relative mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-300 animate-[shake_0.4s_ease-out]">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="relative space-y-4">
            <FloatingInput id="name" label="姓名" type="text" value={name} onChange={setName} icon={User} autoComplete="name" />
            <FloatingInput id="email" label="邮箱地址" type="email" value={email} onChange={setEmail} icon={Mail} autoComplete="email" />
            <FloatingInput id="password" label="密码" type="password" value={password} onChange={setPassword} icon={Lock} autoComplete="new-password" minLength={8} />

            <div className="flex items-center gap-2 pt-1">
              <div className="h-px flex-1 bg-white/[0.04]" />
              <span className="text-[10px] text-white/20 tracking-widest uppercase">至少 8 个字符</span>
              <div className="h-px flex-1 bg-white/[0.04]" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    创建账号
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-white/30">
            已有账号？{" "}
            <Link href="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
