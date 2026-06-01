"use client"

import { useEffect, useRef } from "react"
import { AppSidebar } from "./app-sidebar"
import { X } from "lucide-react"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="fixed inset-y-0 left-0 w-72 animate-in slide-in-from-left bg-sidebar shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
        </button>
        <AppSidebar onClose={onClose} />
      </div>
    </div>
  )
}
