import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '4'
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news/${id}/related?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json)
  } catch (err) {
    console.error('Related news proxy error:', err)
    return NextResponse.json({ data: [] })
  }
}
