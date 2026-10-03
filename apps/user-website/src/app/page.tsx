import type { Metadata } from 'next'
import { api } from '@/lib/api'
import { SITE_URL } from '@/lib/site'
import { HomeContent } from './HomeContent'

type PageProps = { searchParams: Promise<{ category?: string }> }
export const revalidate = 60

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category } = await searchParams
  const categories = category ? await api.getCategories() : []
  const selected = categories.find(item => item.id === category)
  return {
    title: selected ? `${selected.name} വാർത്തകൾ | ThirdEye News` : 'ThirdEye News | മലയാളം വാർത്തകൾ | കോട്ടയം, കേരളം',
    alternates: { canonical: selected ? `${SITE_URL}/?category=${encodeURIComponent(selected.id)}` : SITE_URL },
  }
}

export default async function Home({ searchParams }: PageProps) {
  const { category } = await searchParams
  const selectedCategory = typeof category === 'string' && /^[0-9a-f-]{36}$/i.test(category) ? category : undefined
  const [categories, pinnedNews, trendingNews, recentNews] = await Promise.all([
    api.getCategories(), api.getPinnedNews(selectedCategory, 5),
    api.getTrendingNews(5), api.getRecentNews(selectedCategory, 10, 0),
  ])
  return <HomeContent key={selectedCategory || 'all'} initialCategory={selectedCategory || null}
    initialCategories={categories} initialPinnedNews={pinnedNews}
    initialTrendingNews={trendingNews} initialRecentNews={recentNews} />
}
