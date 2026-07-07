import { NextRequest, NextResponse } from 'next/server'
import { adsService } from '@/services/ads.service'

export async function GET() {
  const result = await adsService.getAllAds()
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await adsService.createAd(body)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ data: result.data })
}
