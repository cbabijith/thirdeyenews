import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken, corsHeaders } from '@/lib/verifyBearerToken'
import { newsRepository } from '@/features/news/repositories/news.repository'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const { id } = await params
    const newsItem = await newsRepository.findById(id, false)
    if (!newsItem) {
      return NextResponse.json({ error: 'News not found' }, { status: 404, headers: corsHeaders })
    }
    await newsRepository.incrementViewCount(newsItem.id)
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to increment view' },
      { status: 500, headers: corsHeaders }
    )
  }
}
