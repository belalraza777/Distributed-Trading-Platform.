import { NextRequest, NextResponse } from "next/server"

// runs before every page load
// protects routes based on login state and role
export function middleware(req: NextRequest) {
  const token = req.cookies.get("trading_token")?.value
  const { pathname } = req.nextUrl

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isAdminPage = pathname.startsWith("/admin")
  const isPublicPage = pathname === "/"

  // not logged in — redirect to login (except public pages)
  if (!token && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // logged in — redirect away from login/register
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

// which routes this middleware applies to 
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}