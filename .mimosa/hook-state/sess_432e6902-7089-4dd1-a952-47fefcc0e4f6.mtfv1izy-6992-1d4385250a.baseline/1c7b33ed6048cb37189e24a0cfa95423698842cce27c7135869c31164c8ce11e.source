import { NextRequest, NextResponse } from 'next/server'
import { categoriesService } from '@/features/category'

export async function GET() {
  const result = await categoriesService.getAllCategories()
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await categoriesService.createCategory(body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ data: result.data }, { status: 201 })
}
