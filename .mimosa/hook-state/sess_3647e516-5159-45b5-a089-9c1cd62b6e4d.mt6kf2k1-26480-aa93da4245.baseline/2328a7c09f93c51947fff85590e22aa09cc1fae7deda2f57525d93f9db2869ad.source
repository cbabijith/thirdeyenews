import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken, corsHeaders } from '@/lib/verifyBearerToken'
import { newsRepository } from '@/features/news/repositories/news.repository'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '4', 10)

    const newsItem = await newsRepository.findById(id, false)
    if (!newsItem) {
      return NextResponse.json({ error: 'News not found' }, { status: 404, headers: corsHeaders })
    }
    const categoryId = newsItem.category_id || null

    const related = await newsRepository.findRelatedPublished(newsItem.id, categoryId, limit)
    return NextResponse.json({ data: related }, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch related news' },
      { status: 500, headers: corsHeaders }
    )
  }
}
