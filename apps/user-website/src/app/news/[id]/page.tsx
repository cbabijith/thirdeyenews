import { notFound } from 'next/navigation'
import { api, NewsItem } from '@/lib/api'
import { NewsDetailClient } from './NewsDetailClient'

export const revalidate = 60
export const dynamic = 'force-dynamic'

interface RelatedNews {
  id: string
  title: string
  image_url?: string | null
  published_at?: string | null
  categories?: {
    name: string
  }
}

async function fetchNews(id: string): Promise<NewsItem | null> {
  const data = await api.getNewsById(id)
  if (!data || !data.is_published) return null
  return data
}

async function fetchRelatedNews(newsId: string, categoryId?: string | null): Promise<RelatedNews[]> {
  try {
    const data = await api.getRelatedNews(newsId, 4)
    return data as unknown as RelatedNews[]
  } catch (err) {
    console.error('Failed to fetch related news:', err)
    return []
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await fetchNews(id)

  if (!news) {
    notFound()
  }

  const relatedNews = await fetchRelatedNews(id, news?.category_id)

  return <NewsDetailClient news={news} relatedNews={relatedNews} />
}
