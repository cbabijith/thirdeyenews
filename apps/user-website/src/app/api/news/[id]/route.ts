import { NextRequest, NextResponse } from 'next/server'
import { toAdminUrl } from '@/lib/adminUrl'

export const runtime = 'edge'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(toAdminUrl(`/api/public/news/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json, {
      status: res.status,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    })
  } catch (err) {
    console.error('News by ID proxy error:', err)
    return NextResponse.json({ data: null }, { status: 404 })
  }
}
