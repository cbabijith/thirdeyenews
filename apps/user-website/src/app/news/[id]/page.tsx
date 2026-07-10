import { notFound } from 'next/navigation'
import { api, NewsItem } from '@/lib/api'
import { NewsDetailClient } from './NewsDetailClient'

export const revalidate = 60

interface RelatedNews {
  id: string
  title: string
  image_url?: string | null
  published_at?: string | null
  categories?: {
    name: string
  }
}

const newsCache = new Map<string, { data: NewsItem | null; ts: number }>()
const CACHE_TTL = 60_000

async function fetchNews(id: string): Promise<NewsItem | null> {
  const cached = newsCache.get(id)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }
  const data = await api.getNewsById(id)
  if (!data || !data.is_published) {
    newsCache.set(id, { data: null, ts: Date.now() })
    return null
  }
  newsCache.set(id, { data, ts: Date.now() })
  return data
}

async function fetchRelatedNews(newsId: string, categoryId?: string | null): Promise<RelatedNews[]> {
  try {
    const data = await api.getRelatedNews(newsId, 4)
    return Array.isArray(data) ? (data as unknown as RelatedNews[]) : []
  } catch (err) {
    console.error('Failed to fetch related news:', err)
    return []
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const news = await fetchNews(id)

    if (!news) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h1>News Not Found</h1>
          <p>id: {id}</p>
        </div>
      )
    }

    const [_, relatedNews] = await Promise.all([
      Promise.resolve(news),
      fetchRelatedNews(id, news?.category_id)
    ])

    return <NewsDetailClient news={news} relatedNews={relatedNews} />
  } catch (err: any) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
        <h1>Server Rendering Error</h1>
        <p>{err?.message || String(err)}</p>
        <pre>{err?.stack}</pre>
      </div>
    )
  }
}
