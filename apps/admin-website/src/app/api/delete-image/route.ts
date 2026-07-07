import { NextRequest, NextResponse } from 'next/server'
import { deleteImage as r2Delete } from '@thirdeyenews/shared-supabase'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const newsIdx = pathParts.indexOf('news')
    let key = pathParts[pathParts.length - 1]
    if (newsIdx !== -1) {
      key = pathParts.slice(newsIdx).join('/')
    }

    await r2Delete(key)
    return NextResponse.json({ success: true, error: null })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
