import supabase from '@thirdeyenews/shared-supabase'
import { notFound } from 'next/navigation'
import { NewsDetailClient } from './NewsDetailClient'

export const revalidate = 60

interface NewsItem {
  id: string
  title: string
  content: string
  description?: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  view_count?: number
  categories?: {
    name: string
    slug: string
  }
  profiles?: {
    full_name?: string
  }
}

interface RelatedNews {
  id: string
  title: string
  image_url?: string
  published_at?: string
  categories?: {
    name: string
  }
}

async function fetchNews(id: string) {
  const { data, error } = await supabase
    .from('news')
    .select('id, title, content, description, image_url, youtube_link, published_at, is_pinned, view_count, categories(name, slug), profiles(full_name)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !data) return null
  return data as unknown as NewsItem
}

async function fetchRelatedNews(newsId: string) {
  const { data } = await supabase
    .from('news')
    .select('id, title, image_url, published_at, categories(name)')
    .eq('is_published', true)
    .neq('id', newsId)
    .order('published_at', { ascending: false })
    .limit(4)

  return (data || []) as unknown as RelatedNews[]
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const news = await fetchNews(id)

  if (!news) {
    notFound()
  }

  const relatedNews = await fetchRelatedNews(id)

  return <NewsDetailClient news={news} relatedNews={relatedNews} />
}
