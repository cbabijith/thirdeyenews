import { NextRequest, NextResponse } from 'next/server'
import { newsService } from '@/features/news/services/news.service'
import { newsRepository } from '@/features/news/repositories/news.repository'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search') || undefined
  const categoryId = searchParams.get('categoryId') || undefined
  const published = searchParams.get('published')
  const sortBy = (searchParams.get('sortBy') as 'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc') || 'date-desc'
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  // If simple list without search params
  if (!search && !categoryId && published === null && sortBy === 'date-desc' && limit === 10 && offset === 0) {
    const result = await newsService.getNewsForListPage(limit, offset)
    return NextResponse.json({ data: result.data, count: result.count })
  }

  // Otherwise use search with params
  const result = await newsService.searchNews({
    searchQuery: search,
    categoryId,
    sortBy,
    limit,
    offset,
  })

  // If published filter is set, filter at DB level
  if (published === 'true') {
    const publishedData = result.data.filter(item => item.is_published)
    const publishedCount = await newsRepository.countPublished()
    return NextResponse.json({ data: publishedData, count: publishedCount })
  }

  if (published === 'false') {
    const draftData = result.data.filter(item => !item.is_published)
    const draftCount = await newsRepository.countDrafts()
    return NextResponse.json({ data: draftData, count: draftCount })
  }

  return NextResponse.json({ data: result.data, count: result.count })
}

import { triggerRevalidation } from '@/lib/revalidate'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await newsService.createNews(body)
  if (result.error) {
    console.error('Error in POST /api/news:', result.error)
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  if (result.data) {
    triggerRevalidation(result.data.slug || result.data.id).catch(console.error)
  }
  return NextResponse.json({ data: result.data })
}
