import { NextRequest, NextResponse } from 'next/server'
import { subcategoriesService } from '@/features/category'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await subcategoriesService.getSubcategoryById(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ data: result.data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const result = await subcategoriesService.updateSubcategory(id, body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ data: result.data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const hasNews = await subcategoriesService.hasRelatedNews(id)
  if (hasNews) {
    return NextResponse.json(
      { error: 'Cannot delete subcategory with related news items' },
      { status: 409 }
    )
  }

  const result = await subcategoriesService.deleteSubcategory(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
