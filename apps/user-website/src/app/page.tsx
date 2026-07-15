import { Suspense } from 'react'
import { api, Category, NewsItem } from '@/lib/api'
import { Header } from '@/components/Header'
import { ShimmerBox } from '@/components/Shimmer'
import { HomeContent } from './HomeContent'

export const revalidate = 60

async function fetchHomeData() {
  try {
    const [categories, pinnedNews, trendingNews, recentNews] = await Promise.all([
      api.getCategories(),
      api.getPinnedNews(undefined, 5),
      api.getTrendingNews(5),
      api.getRecentNews(undefined, 10, 0),
    ])

    return {
      categories: categories as Category[],
      pinnedNews: pinnedNews as NewsItem[],
      trendingNews: trendingNews as NewsItem[],
      recentNews: recentNews as NewsItem[],
    }
  } catch (err) {
    console.error('Failed to fetch home data:', err)
    return {
      categories: [] as Category[],
      pinnedNews: [] as NewsItem[],
      trendingNews: [] as NewsItem[],
      recentNews: [] as NewsItem[],
    }
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
