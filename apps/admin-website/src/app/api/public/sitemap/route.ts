import { NextRequest, NextResponse } from 'next/server'
import { asc, count, eq } from 'drizzle-orm'
import { db } from '@/db'
import { news, categories } from '@/db/schema'
import { verifyBearerToken } from '@/lib/verifyBearerToken'

export async function GET(req: NextRequest) {
  const authError = verifyBearerToken(req)
  if (authError) return authError
  const page = Number(req.nextUrl.searchParams.get('page') || '0')
  if (!Number.isInteger(page) || page < 0 || page > 10000) return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
  try {
    const [articles, [total], sections] = await Promise.all([
      db.select({ id: news.id, slug: news.slug, updated_at: news.updated_at }).from(news)
        .where(eq(news.is_published, true)).orderBy(asc(news.id)).limit(1000).offset(page * 1000),
      db.select({ count: count() }).from(news).where(eq(news.is_published, true)),
      page === 0 ? db.select({ id: categories.id }).from(categories) : Promise.resolve([]),
    ])
    return NextResponse.json({ data: { articles, total: total.count, categories: sections } }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Sitemap query failed', error)
    return NextResponse.json({ error: 'Sitemap temporarily unavailable' }, { status: 503 })
  }
}
