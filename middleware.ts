import { NextResponse, type NextRequest } from "next/server"
import { verifyAdminSession } from "@/lib/auth/admin"
import { verifyJudgeSession } from "@/lib/auth/judge"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".") || pathname === "/") {
    return NextResponse.next()
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("admin-session")?.value

    // Allow access to login page
    if (pathname === "/admin/login") {
      // If already logged in, redirect to dashboard
      if (sessionToken) {
        const admin = await verifyAdminSession(sessionToken)
        if (admin) {
          return NextResponse.redirect(new URL("/admin", request.url))
        }
      }
      return NextResponse.next()
    }

    // Protect other admin routes
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("admin-session")
      return response
    }
  }

  // Judge routes protection
  if (pathname.startsWith("/judge")) {
    const sessionToken = request.cookies.get("judge-session")?.value

    // Allow access to login page
    if (pathname === "/judge/login") {
      // If already logged in, redirect to dashboard
      if (sessionToken) {
        const judge = await verifyJudgeSession(sessionToken)
        if (judge) {
          return NextResponse.redirect(new URL("/judge", request.url))
        }
      }
      return NextResponse.next()
    }

    // Protect other judge routes
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/judge/login", request.url))
    }

    const judge = await verifyJudgeSession(sessionToken)
    if (!judge) {
      const response = NextResponse.redirect(new URL("/judge/login", request.url))
      response.cookies.delete("judge-session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
