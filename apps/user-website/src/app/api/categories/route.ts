import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let categoriesCache: { data: any; ts: number } | null = null
const CATEGORIES_CACHE_TTL = 300_000 // 5 minutes cache

export async function GET() {
  try {
    if (categoriesCache && Date.now() - categoriesCache.ts < CATEGORIES_CACHE_TTL) {
      return NextResponse.json(categoriesCache.data)
    }

    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    categoriesCache = { data: json, ts: Date.now() }
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('Categories proxy error:', err)
    // Return stale cache if available on error, otherwise fallback
    if (categoriesCache) {
      return NextResponse.json(categoriesCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      })
    }
    return NextResponse.json({ data: [] })
  }
}
