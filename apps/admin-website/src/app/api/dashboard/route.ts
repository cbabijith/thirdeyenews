import { NextRequest, NextResponse } from 'next/server'
import { dashboardService } from '@/services/dashboard.service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const timeframe = (searchParams.get('timeframe') as 'today' | 'yesterday' | 'week' | 'month' | 'all') || 'all'
  const stats = await dashboardService.getStats(timeframe)
  return NextResponse.json({ data: stats })
}
