import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { api, NewsItem } from '@/lib/api'
import { NewsDetailClient } from './NewsDetailClient'

export const revalidate = 60

interface RelatedNews {
  id: string
  title: string
  slug?: string | null
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const news = await fetchNews(id)

  if (!news) {
    return {
      title: 'ThirdEye News',
      description: 'Malayalam News Portal',
    }
  }

  const title = news.title || 'ThirdEye News'
  const description = news.description || news.content?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Malayalam News Portal'
  const image = news.image_url || '/logo.png'
  const url = `https://thirdeyenewslive.com/news/${news.slug || news.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'ThirdEye News',
      locale: 'ml_IN',
      type: 'article',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: news.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await fetchNews(id)

  if (!news) {
    notFound()
  }

  const [_, relatedNews] = await Promise.all([
    Promise.resolve(news),
    fetchRelatedNews(id, news?.category_id)
  ])

  return <NewsDetailClient news={news} relatedNews={relatedNews} />
}
