import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/publicProxy'

export async function GET(req: NextRequest) {
  return publicProxy('/ads' + req.nextUrl.search)
}
