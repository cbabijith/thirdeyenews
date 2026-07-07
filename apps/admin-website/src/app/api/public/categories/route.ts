import { NextRequest, NextResponse } from 'next/server'
import { verifyBearerToken } from '@/lib/verifyBearerToken'
import { categoriesRepository } from '@/features/category/repositories/categories.repository'

export async function GET(req: NextRequest) {
  const authError = verifyBearerToken(req)
  if (authError) return authError

  try {
    const categories = await categoriesRepository.findAll()
    return NextResponse.json({ data: categories })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
