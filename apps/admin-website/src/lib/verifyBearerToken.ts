import { NextRequest, NextResponse } from 'next/server'

export function verifyBearerToken(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const expectedToken = process.env.API_ACCESS_TOKEN

  if (!expectedToken) {
    return NextResponse.json({ error: 'API access token not configured' }, { status: 500 })
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  return null
}
