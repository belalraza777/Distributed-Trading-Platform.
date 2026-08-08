import { NextRequest, NextResponse } from "next/server"

// Next.js middleware runs on the server — it can't read localStorage.
// So we save the token in a cookie on login (done in auth.store.ts setAuth)
// and read that cookie here for route protection.

export function middleware(req: NextRequest) {
  const token = req.cookies.get("trading_access_token")?.value
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/"

  // not logged in — redirect to login
  if (!token && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // already logged in — redirect away from auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}