import { NextRequest, NextResponse } from 'next/server'

function getAdminBaseUrl(): string {
  return process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'
}

function getToken(): string {
  return process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || ''
}

async function proxyRequest(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = '/' + pathSegments.join('/')
  const url = new URL(req.url)
  const targetUrl = `${getAdminBaseUrl()}/api/public${path}${url.search}`

  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: await req.text() } : {}),
    })

    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to reach API server' },
      { status: 502 }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(req, path)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
