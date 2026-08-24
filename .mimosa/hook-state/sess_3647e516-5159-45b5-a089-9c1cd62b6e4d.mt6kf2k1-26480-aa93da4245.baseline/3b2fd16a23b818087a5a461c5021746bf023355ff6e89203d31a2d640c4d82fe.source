import { NextRequest, NextResponse } from 'next/server'
import { adsService } from '@/features/ads'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await adsService.getAdById(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }
  return NextResponse.json({ data: result.data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const result = await adsService.updateAd(id, body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await adsService.deleteAd(id)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: null })
}
