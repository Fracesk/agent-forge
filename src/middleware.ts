import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for session token in cookies (authjs.session-token or next-auth.session-token)
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("__Host-next-auth.session-token")?.value

  const isLoggedIn = !!sessionToken
  const isApiAuthRoute = pathname.startsWith("/api/auth")
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname === "/"
  const isDashboardRoute =
    pathname.startsWith("/agents") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/collaborations") ||
    pathname.startsWith("/settings")

  if (isApiAuthRoute || isStaticAsset) return NextResponse.next()

  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/agents", req.url))
    return NextResponse.next()
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
