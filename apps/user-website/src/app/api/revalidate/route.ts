import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    const token = searchParams.get('token')

    const secretToken = process.env.REVALIDATION_TOKEN || 'fallback-secret-key-123'
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (path) {
      revalidatePath(path)
      revalidatePath('/')
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

    const secretToken = process.env.REVALIDATION_TOKEN || 'fallback-secret-key-123'
    if (token !== secretToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (path) {
      revalidatePath(path)
      revalidatePath('/')
      return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
