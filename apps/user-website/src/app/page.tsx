import { Suspense } from 'react'
import supabase from '@thirdeyenews/shared-supabase'
import { Header } from '@/components/Header'
import { ShimmerBox } from '@/components/Shimmer'
import { HomeContent } from './HomeContent'

export const revalidate = 60

interface Category {
  id: string
  name: string
  slug: string
}

interface NewsItem {
  id: string
  title: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  categories?: { name: string; slug: string }
  profiles?: { full_name?: string; email?: string }
}

async function fetchHomeData() {
  const [categoriesRes, pinnedRes, trendingRes, recentRes] = await Promise.all([
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('news').select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', true).order('published_at', { ascending: false }).limit(5),
    supabase.from('news').select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)').eq('is_published', true).order('view_count', { ascending: false, nullsFirst: false }).limit(5),
    supabase.from('news').select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', false).order('published_at', { ascending: false }).limit(10),
  ])

  return {
    categories: (categoriesRes.data || []) as Category[],
    pinnedNews: (pinnedRes.data || []) as unknown as NewsItem[],
    trendingNews: (trendingRes.data || []) as unknown as NewsItem[],
    recentNews: (recentRes.data || []) as unknown as NewsItem[],
  }
}

export default async function Home() {
  const data = await fetchHomeData()

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-10 bg-surface-container border-b border-border" />
        <div className="flex gap-2 px-4 py-3 overflow-hidden">
          {[1,2,3,4,5].map(i => <ShimmerBox key={i} className="h-8 w-24 rounded-full flex-shrink-0" />)}
        </div>
        <main className="block md:hidden px-4 py-4">
          <ShimmerBox className="w-full aspect-[16/9] rounded-xl" />
          <div className="mt-6 flex flex-col gap-3">
            {[1,2,3,4,5].map(i => <ShimmerBox key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        </main>
      </div>
    }>
      <HomeContent
        initialCategories={data.categories}
        initialPinnedNews={data.pinnedNews}
        initialTrendingNews={data.trendingNews}
        initialRecentNews={data.recentNews}
      />
    </Suspense>
  )
}
