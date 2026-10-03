import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return new NextResponse(null, { status: 403 })
  if (Number(req.headers.get('content-length') || 0) > 8192) return new NextResponse(null, { status: 413 })
  try {
    const text = await req.text()
    if (text.length > 8192) return new NextResponse(null, { status: 413 })
    const body = JSON.parse(text)
    const short = (value: unknown, length: number) => typeof value === 'string' ? value.slice(0, length) : ''
    console.error('Reader page error', {
      message: short(body.message, 500), digest: short(body.digest, 100),
      path: short(body.path, 300).split('?')[0], browser: short(req.headers.get('user-agent'), 200),
    })
    return new NextResponse(null, { status: 204 })
  } catch { return new NextResponse(null, { status: 400 }) }
}
