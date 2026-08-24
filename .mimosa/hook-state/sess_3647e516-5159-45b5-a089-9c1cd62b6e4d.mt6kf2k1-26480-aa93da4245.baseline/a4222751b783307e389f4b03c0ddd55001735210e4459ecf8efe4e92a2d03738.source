import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function verifyBearerToken(req: NextRequest): NextResponse | null {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401, headers: corsHeaders })
  }

  const token = authHeader.slice(7)
  const expectedToken = process.env.API_ACCESS_TOKEN

  if (!expectedToken) {
    return NextResponse.json({ error: 'API access token not configured' }, { status: 500, headers: corsHeaders })
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403, headers: corsHeaders })
  }

  return null
}

export { corsHeaders }

