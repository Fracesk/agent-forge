"use client"

import { useEffect, useRef } from "react"

const NODES = [
  { x: 12, y: 15, size: 8 }, { x: 35, y: 10, size: 6 }, { x: 58, y: 18, size: 7 }, { x: 82, y: 12, size: 5 },
  { x: 18, y: 42, size: 6 }, { x: 48, y: 40, size: 9 }, { x: 75, y: 38, size: 6 }, { x: 10, y: 72, size: 5 },
  { x: 38, y: 70, size: 7 }, { x: 65, y: 62, size: 6 }, { x: 85, y: 72, size: 8 }, { x: 30, y: 25, size: 4 },
  { x: 70, y: 25, size: 5 }, { x: 52, y: 75, size: 4 },
]

const CONNECTIONS = [
  [0, 1], [0, 4], [1, 2], [1, 5], [2, 3], [2, 6],
  [4, 5], [4, 7], [5, 6], [5, 8], [6, 9], [7, 8],
  [8, 9], [8, 12], [9, 10], [9, 11], [11, 12],
  [0, 11], [3, 6], [4, 11], [2, 5],
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let mouseX = 0
    let mouseY = 0
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY })

    const nodes = NODES.map(n => ({
      ...n,
      xPx: (n.x / 100) * canvas.width,
      yPx: (n.y / 100) * canvas.height,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
    }))

    const conns = CONNECTIONS.map(([f, t]) => ({ from: nodes[f], to: nodes[t] }))

    function draw() {
      time += 0.005
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      // Update node positions with subtle mouse parallax + drift
      nodes.forEach(n => {
        const dx = mouseX - n.xPx
        const dy = mouseY - n.yPx
        const dist = Math.sqrt(dx * dx + dy * dy)
        const pull = Math.max(0, 1 - dist / 800) * 0.02
        n.vx += dx * pull
        n.vy += dy * pull
        n.vx += Math.sin(time + n.phase) * 0.02
        n.vy += Math.cos(time * 0.7 + n.phase) * 0.02
        n.vx *= 0.97
        n.vy *= 0.97
        n.xPx += n.vx
        n.yPx += n.vy
        n.xPx = Math.max(20, Math.min(canvas!.width - 20, n.xPx))
        n.yPx = Math.max(20, Math.min(canvas!.height - 20, n.yPx))
      })

      // Draw connections — warm amber instead of cold blue
      conns.forEach(c => {
        ctx!.beginPath()
        ctx!.moveTo(c.from.xPx, c.from.yPx)
        ctx!.lineTo(c.to.xPx, c.to.yPx)
        ctx!.strokeStyle = "rgba(212, 165, 116, 0.06)"
        ctx!.lineWidth = 1
        ctx!.stroke()
      })

      // Draw node glows + cores — warm amber tones
      nodes.forEach(n => {
        const pulse = 0.6 + Math.sin(time * 2 + n.phase) * 0.4
        const glow = ctx!.createRadialGradient(n.xPx, n.yPx, 0, n.xPx, n.yPx, n.size * 5)
        glow.addColorStop(0, `rgba(212, 165, 116, ${0.07 * pulse})`)
        glow.addColorStop(1, "rgba(212, 165, 116, 0)")
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(n.xPx, n.yPx, n.size * 5, 0, Math.PI * 2)
        ctx!.fill()

        // Core
        ctx!.fillStyle = `rgba(230, 190, 140, ${0.2 * pulse})`
        ctx!.beginPath()
        ctx!.arc(n.xPx, n.yPx, n.size * 0.4, 0, Math.PI * 2)
        ctx!.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0a08] selection:bg-amber-500/30">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Deep warm gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a08]/90 via-amber-950/40 to-[#0c0a08] -z-10" />

      {/* Animated gradient orbs — warm amber/gold */}
      <div
        className="absolute left-[5%] top-[10%] h-[600px] w-[600px] animate-[orbFloat_25s_ease-in-out_infinite] rounded-full opacity-40 blur-[180px]"
        style={{ background: "radial-gradient(circle, rgba(212,165,116,0.15), rgba(180,120,80,0.05) 50%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[5%] right-[5%] h-[500px] w-[500px] animate-[orbFloat2_30s_ease-in-out_infinite] rounded-full opacity-30 blur-[160px]"
        style={{ background: "radial-gradient(circle, rgba(230,190,140,0.1), rgba(200,150,100,0.03) 50%, transparent 70%)" }}
      />
      <div
        className="absolute left-[40%] top-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-[orbFloat_35s_ease-in-out_infinite_reverse] rounded-full opacity-20 blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(240,200,160,0.08), transparent 60%)" }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Grid overlay — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,165,116,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,165,116,.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Dark vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,6,4,0.7)_100%)]" />

      {/* Accent light leak — top right */}
      <div className="absolute -top-40 right-[20%] h-[300px] w-[300px] rotate-45 opacity-[0.08] blur-[100px]"
        style={{ background: "linear-gradient(135deg, rgba(212,165,116,0.3), transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px] animate-[fadeSlideUp_0.8s_ease-out_both]">
        {children}
      </div>
    </div>
  )
}
