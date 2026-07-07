import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken, corsHeaders } from '@/lib/verifyBearerToken'
import { adsRepository } from '@/features/ads/repositories/ads.repository'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const position = searchParams.get('position') || 'main_banner'
    const limit = parseInt(searchParams.get('limit') || '3', 10)

    const ads = await adsRepository.findActiveByPosition(position as any)
    return NextResponse.json({ data: ads.slice(0, limit) }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ads' },
      { status: 500, headers: corsHeaders }
    )
  }
}
