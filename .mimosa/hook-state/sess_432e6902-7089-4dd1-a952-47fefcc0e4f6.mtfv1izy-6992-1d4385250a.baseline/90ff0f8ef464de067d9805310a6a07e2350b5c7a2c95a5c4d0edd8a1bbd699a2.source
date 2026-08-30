import { NextRequest, NextResponse } from 'next/server'
import { newsService } from '@/features/news/services/news.service'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const includeCategory = _req.nextUrl.searchParams.get('includeCategory') !== 'false'
  const result = await newsService.getNewsById(id, includeCategory)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ data: result.data })
}

import { triggerRevalidation } from '@/lib/revalidate'

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const result = await newsService.updateNews(id, body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  if (result.data) {
    triggerRevalidation(result.data.slug || result.data.id).catch(console.error)
  }
  return NextResponse.json({ data: result.data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  // Fetch news before deletion to retrieve its slug for cache revalidation
  const existing = await newsService.getNewsById(id, false)
  const slug = existing.data?.slug

  const result = await newsService.deleteNews(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  // Trigger cache revalidation on user website for both ID and slug paths
  triggerRevalidation(id).catch(console.error)
  if (slug) {
    triggerRevalidation(slug).catch(console.error)
  }
  return NextResponse.json({ data: null })
}
