import { NextRequest, NextResponse } from 'next/server'
import { publicProxy } from '@/lib/publicProxy'

type Params = { params: Promise<{ path: string[] }> }
async function proxy(req: NextRequest, { params }: Params) {
  const { path: original } = await params
  const parts = original[0] === 'public' ? original.slice(1) : original
  const validId = parts[1] && !['.', '..'].includes(parts[1])
  const read = parts.length === 1 && ['news', 'categories', 'ads'].includes(parts[0]) ||
    parts[0] === 'news' && validId && (parts.length === 2 || parts.length === 3 && ['related', 'adjacent'].includes(parts[2]))
  const view = parts[0] === 'news' && validId && parts.length === 3 && parts[2] === 'view'
  if (!(req.method === 'GET' && read || req.method === 'POST' && view)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const response = await publicProxy('/' + parts.map(encodeURIComponent).join('/') + req.nextUrl.search, req.method)
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
export const GET = proxy
export const POST = proxy
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  } })
}
