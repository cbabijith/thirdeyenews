import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/verifyBearerToken'
import { newsRepository } from '@/features/news/repositories/news.repository'

export async function GET(req: NextRequest) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'recent'
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const q = searchParams.get('q')

    if (q) {
      const results = await newsRepository.searchPublished(q, limit, offset)
      return NextResponse.json({ data: results })
    }

    if (type === 'pinned') {
      const data = await newsRepository.findPinnedPublished(category, limit)
      return NextResponse.json({ data })
    }

    if (type === 'trending') {
      const data = await newsRepository.findTopViewed(limit)
      return NextResponse.json({ data })
    }

    const data = await newsRepository.findRecentPublished(category, limit, offset)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
