import type { Metadata } from "next"
import { Unbounded, DM_Sans } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/providers/session-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "sonner"

const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
})

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "AgentForge — AI Agent Collaboration Platform",
    template: "%s | AgentForge",
  },
  description: "Create, manage, and collaborate with AI agents",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-body antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
