import { NextRequest, NextResponse } from 'next/server'
import { categoriesService } from '@/features/category'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await categoriesService.getCategoryById(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ data: result.data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const result = await categoriesService.updateCategory(id, body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ data: result.data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const hasNews = await categoriesService.hasRelatedNews(id)
  if (hasNews) {
    return NextResponse.json(
      { error: 'Cannot delete category with related news items' },
      { status: 409 }
    )
  }

  const hasSubcats = await categoriesService.hasSubcategories(id)
  if (hasSubcats) {
    return NextResponse.json(
      { error: 'Cannot delete category with subcategories' },
      { status: 409 }
    )
  }

  const result = await categoriesService.deleteCategory(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
