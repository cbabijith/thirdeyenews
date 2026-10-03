import { NextRequest } from 'next/server'
import { publicProxy } from '@/lib/publicProxy'

export async function GET(req: NextRequest) {
  return publicProxy('/categories' + req.nextUrl.search)
}
