import { NextRequest, NextResponse } from 'next/server'
import { subcategoriesService } from '@/features/category'

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId')
  if (categoryId) {
    const result = await subcategoriesService.getSubcategoriesByCategory(categoryId)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ data: result.data })
  }
  const result = await subcategoriesService.getAllSubcategories()
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await subcategoriesService.createSubcategory(body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ data: result.data }, { status: 201 })
}
