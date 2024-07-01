import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const path = request.nextUrl.pathname

  if (path === "/" && token) {
    return NextResponse.redirect(new URL("/admin", request.nextUrl))
  }
  if (path !== "/" && !token) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXTAUTH_URL}`, request.nextUrl)
    )
  }
}

export const config = {
  matcher: ["/", "/admin/:path*"],
}
