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
    await newsRepository.incrementViewCount(id)
    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to increment view' },
      { status: 500, headers: corsHeaders }
    )
  }
}
