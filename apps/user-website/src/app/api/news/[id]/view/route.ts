import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''
    const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news/${id}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    const json = await res.json()
    return NextResponse.json(json)
  } catch (err) {
    console.error('View increment proxy error:', err)
    return NextResponse.json({ success: false })
  }
}
