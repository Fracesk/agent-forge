"use client"

import { signIn } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react"

function FloatingInput({
  id, label, type, value, onChange, ...props
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void;
  [key: string]: any
}) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isUp = focused || hasValue

  return (
    <div className="relative group">
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
          ${focused ? "border-amber-400/40 bg-white/[0.05] shadow-[0_0_24px_rgba(212,165,116,0.06)]" : "border-white/10"}
          hover:border-white/20
        `}
        {...props}
      />
      <label
        htmlFor={id}
        onClick={() => document.getElementById(id)?.focus()}
        className={`absolute left-4 top-3.5 text-sm transition-all duration-300 ease-out pointer-events-none cursor-text
          ${isUp ? "text-[10px] -translate-y-4 text-amber-300/60" : "text-white/30 translate-y-0"}
        `}
      >
        {label}
      </label>
      <div className={`
        absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-amber-400/60 to-amber-300/40
        transition-all duration-500 ease-out pointer-events-none
        ${focused ? "opacity-70 scale-x-100" : "opacity-0 scale-x-0"}
      `} />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setMounted(true) }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || !password) return
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", { email, password, redirect: false })

      if (result?.error) {
        setError("邮箱或密码错误")
      } else {
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
        {/* Logo */}
        <div className="mb-10 text-center" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity 0.7s ease-out, transform 0.7s ease-out" }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 animate-[logoReveal_0.8s_ease-out_both]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/90 font-display">AgentForge</h1>
          <p className="mt-2 text-sm text-white/40 font-light tracking-wide">欢迎进入 AI 指挥中心</p>
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
          {/* Animated border glow */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700" style={{
            background: "linear-gradient(135deg, rgba(212,165,116,0.25), rgba(180,120,80,0.08), rgba(230,190,140,0.15), rgba(212,165,116,0.25))",
            backgroundSize: "300% 300%",
            animation: "borderGlow 4s ease-in-out infinite",
          }} />
          <div className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100" />

          {error && (
            <div className="relative mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-300 animate-[shake_0.4s_ease-out]">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            </div>
          )}

          <form ref={formRef} onSubmit={onSubmit} className="relative space-y-5">
            <FloatingInput
              id="email" label="邮箱地址" type="email" value={email}
              onChange={setEmail} autoComplete="email" spellCheck={false}
            />
            <FloatingInput
              id="password" label="密码" type={showPassword ? "text" : "password"} value={password}
              onChange={setPassword} autoComplete="current-password"
            />

            {/* Show/hide password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-[88px] text-white/20 hover:text-white/50 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
            >
              {/* Button shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    登录
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-[#0c0a08] px-4 text-white/25">或使用以下方式登录</span>
            </div>
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={() => signIn("github", { callbackUrl: "/agents" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/60 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/80 active:scale-[0.99]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>

          <p className="mt-7 text-center text-sm text-white/30">
            还没有账号？{" "}
            <Link href="/register" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
              注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
