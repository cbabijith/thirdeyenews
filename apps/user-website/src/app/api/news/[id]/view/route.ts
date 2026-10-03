import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/publicProxy'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return publicProxy(`/news/${encodeURIComponent(id)}/view${req.nextUrl.search}`, 'POST')
}
