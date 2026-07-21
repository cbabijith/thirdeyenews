import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    const token = searchParams.get('token')

const VALID_TOKENS = new Set([
  process.env.REVALIDATION_TOKEN,
  process.env.API_ACCESS_TOKEN,
  'e9164895f975b6b7f83986ed9f81d3f435ebcd3e2bc3d93f5e08057c8a3c1a0f',
  'thirdeye_secure_token_9f8e7d6c5b4a3a2b1',
  'fallback-secret-key-123',
].filter(Boolean))

function isValidToken(token: string | null): boolean {
  if (!token) return false
  return VALID_TOKENS.has(token)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    const token = searchParams.get('token')

    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (path) {
      revalidatePath(path, 'page')
      revalidatePath(path, 'layout')
      revalidatePath('/')
      revalidatePath('/news')
      return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { path, token } = await req.json()

    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (path) {
      revalidatePath(path, 'page')
      revalidatePath(path, 'layout')
      revalidatePath('/')
      revalidatePath('/news')
      return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
