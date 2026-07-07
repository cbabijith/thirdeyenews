import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const position = searchParams.get('position') || 'main_banner'
  const limit = searchParams.get('limit') || '3'
  const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/ads?position=${position}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
    },
  })
  const json = await res.json()
  return NextResponse.json(json)
}
