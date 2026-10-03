import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const { path, token } = await req.json()
    const tokens = [process.env.REVALIDATION_TOKEN, process.env.API_ACCESS_TOKEN].filter(Boolean)
    if (typeof token !== 'string' || !tokens.includes(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.length > 500) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    revalidateTag('public-content', { expire: 0 })
    revalidatePath('/', 'layout')
    revalidatePath('/sitemap.xml')
    revalidatePath('/sitemaps/[page]', 'page')
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    console.error('Revalidation failed', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
