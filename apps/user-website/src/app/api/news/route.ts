import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const newsCache = new Map<string, { data: any; ts: number }>()
const NEWS_CACHE_TTL = 15_000 // 15 seconds cache for active feeds

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.toString()

    const cached = newsCache.get(path)
    if (cached && Date.now() - cached.ts < NEWS_CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news?${path}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
      },
    })
    const json = await res.json()
    newsCache.set(path, { data: json, ts: Date.now() })
    return NextResponse.json(json)
  } catch (err) {
    console.error('News proxy error:', err)
    const { searchParams } = new URL(req.url)
    const path = searchParams.toString()
    const cached = newsCache.get(path)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ data: [] })
  }
}
