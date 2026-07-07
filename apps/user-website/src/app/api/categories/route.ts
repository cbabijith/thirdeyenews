import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetch(`${process.env.ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'}/api/public/categories`, {
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
    },
  })
  const json = await res.json()
  return NextResponse.json(json)
}
