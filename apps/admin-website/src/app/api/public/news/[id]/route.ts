import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/verifyBearerToken'
import { newsRepository } from '@/features/news/repositories/news.repository'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const { id } = await params
    const news = await newsRepository.findById(id)
    if (!news || !news.is_published) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }
    return NextResponse.json({ data: news })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
