import { authMiddleware } from '@/features/auth/authMiddleware'

export const config = {
  matcher: ['/', '/content/:path*', '/login'],
}

export { authMiddleware as proxy }
