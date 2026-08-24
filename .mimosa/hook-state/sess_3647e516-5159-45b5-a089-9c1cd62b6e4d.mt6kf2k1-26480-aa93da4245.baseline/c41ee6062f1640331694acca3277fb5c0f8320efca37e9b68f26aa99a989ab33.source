import { NextRequest, NextResponse } from 'next/server'
import { categoriesService } from '@/features/category'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 })
    }

    const result = await categoriesService.updateCategoryPriorities(updates)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update priorities' }, { status: 500 })
  }
}
