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
    const newsItem = await newsRepository.findById(id, false)
    if (!newsItem) {
      return NextResponse.json({ error: 'News not found' }, { status: 404, headers: corsHeaders })
    }

    const adjacent = await newsRepository.findAdjacentPublished(newsItem.id)
    return NextResponse.json({ data: adjacent }, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch adjacent news' },
      { status: 500, headers: corsHeaders }
    )
  }
}
