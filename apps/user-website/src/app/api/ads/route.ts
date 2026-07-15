import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const position = searchParams.get('position') || 'main_banner'
    const limit = searchParams.get('limit') || '3'
    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/ads?position=${position}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('Ads proxy error:', err)
    return NextResponse.json({ data: [] })
  }
}
