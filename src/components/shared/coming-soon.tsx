"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Sparkles, Code, Rocket, Palette, Cpu, Layers } from "lucide-react"

interface ComingSoonProps {
  title: string
  description?: string
  icon?: React.ReactNode
  features?: string[]
  className?: string
}

const defaultFeatures = [
  "完整增删改查",
  "丰富数据可视化",
  "实时协作",
  "高级筛选与搜索",
]

const featureIcons = [Code, Rocket, Palette, Cpu]

export function ComingSoon({
  title,
  description = "此功能正在开发中，即将上线。",
  icon,
  features = defaultFeatures,
  className,
}: ComingSoonProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Gradient border card */}
        <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

          {/* Animated pulse ring */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20"
            style={{ mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", maskComposite: "exclude", WebkitMaskComposite: "xor", padding: 1 }}
          />

          <div className="relative space-y-6">
            {/* Icon + Title */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
                {icon || <Layers className="h-7 w-7 text-primary" />}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                {description}
              </p>
            </div>

            {/* Feature preview grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.slice(0, 4).map((feature, i) => {
                const Icon = featureIcons[i] || Sparkles
                return (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                    className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground">{feature}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Status badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                </span>
                开发中
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
