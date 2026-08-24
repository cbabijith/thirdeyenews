import { NextRequest } from 'next/server'
import { verifyBearerToken, corsHeaders } from '@/lib/verifyBearerToken'
import { categoriesRepository } from '@/features/category/repositories/categories.repository'
import { NextResponse } from 'next/server'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const categories = await categoriesRepository.findAll()
    return NextResponse.json({ data: categories }, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500, headers: corsHeaders }
    )
  }
}
