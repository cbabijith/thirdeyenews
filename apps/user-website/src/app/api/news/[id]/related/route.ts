import { NextRequest, NextResponse } from 'next/server'
import { toAdminUrl } from '@/lib/adminUrl'

export const runtime = 'edge'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '4'
    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(toAdminUrl(`/api/public/news/${id}/related?limit=${limit}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('Related news proxy error:', err)
    return NextResponse.json({ data: [] })
  }
}
