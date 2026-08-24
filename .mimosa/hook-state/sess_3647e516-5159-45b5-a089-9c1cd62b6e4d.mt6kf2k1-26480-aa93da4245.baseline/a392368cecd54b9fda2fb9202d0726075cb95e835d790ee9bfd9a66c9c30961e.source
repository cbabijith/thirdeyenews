import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const hasAuthCookie = req.cookies.getAll().some(
    (cookie) => cookie.name.includes('auth-token')
  )

  if (!hasAuthCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (hasAuthCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const authMiddlewareConfig = {
  matcher: ['/', '/content/:path*', '/login'],
}
