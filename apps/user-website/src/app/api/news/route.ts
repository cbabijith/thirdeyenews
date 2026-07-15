import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

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

    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news?${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    newsCache.set(path, { data: json, ts: Date.now() })
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10',
      },
    })
  } catch (err) {
    console.error('News proxy error:', err)
    const { searchParams } = new URL(req.url)
    const path = searchParams.toString()
    const cached = newsCache.get(path)
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
        },
      })
    }
    return NextResponse.json({ data: [] })
  }
}
