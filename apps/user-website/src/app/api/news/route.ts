import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.toString()
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news?${path}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json)
  } catch (err) {
    console.error('News proxy error:', err)
    return NextResponse.json({ data: [] })
  }
}
