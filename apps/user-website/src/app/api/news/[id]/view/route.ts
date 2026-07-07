import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/news/${id}/view`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
    },
  })
  const json = await res.json()
  return NextResponse.json(json)
}
