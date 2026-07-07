import { NextRequest, NextResponse } from 'next/server'
import { newsService } from '@/features/news/services/news.service'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search') || undefined
  const categoryId = searchParams.get('categoryId') || undefined
  const published = searchParams.get('published') === 'true'
  const sortBy = (searchParams.get('sortBy') as 'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc') || 'date-desc'
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  // If simple list without search params
  if (!search && !categoryId && !published && sortBy === 'date-desc' && limit === 10 && offset === 0) {
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

  // If published filter is set, filter the results
  if (published) {
    const filteredData = result.data.filter(item => item.is_published)
    const publishedResult = await newsService.getPublishedNews()
    return NextResponse.json({ data: filteredData, count: publishedResult.data?.length || 0 })
  }

  return NextResponse.json({ data: result.data, count: result.count })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await newsService.createNews(body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}
