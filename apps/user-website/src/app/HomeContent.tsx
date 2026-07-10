'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { api, Category, NewsItem } from '@/lib/api'
import { Header } from '@/components/Header'
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker'
import { CategoryBar } from '@/components/CategoryBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { AdBanner } from '@/components/AdBanner'
import { ShimmerBox } from '@/components/Shimmer'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'
import { formatShortDate as fmtShort, formatTime, getTimeAgo as timeAgo } from '@/lib/dateFormat'

interface HomeContentProps {
  initialCategories: Category[]
  initialPinnedNews: NewsItem[]
  initialTrendingNews: NewsItem[]
  initialRecentNews: NewsItem[]
}

const PAGE_SIZE = 10

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. The database might be waking up or your network is slow. Please try again.')), ms)
    )
  ])
}

export function HomeContent({
  initialCategories,
  initialPinnedNews,
  initialTrendingNews,
  initialRecentNews,
}: HomeContentProps) {
  const { colors } = useThemeStore()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [pinnedNews, setPinnedNews] = useState<NewsItem[]>(initialPinnedNews)
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>(initialTrendingNews)
  const [recentNews, setRecentNews] = useState<NewsItem[]>(initialRecentNews)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const skipFilterRef = useRef(true)

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (pinnedNews.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % pinnedNews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [pinnedNews])

  useEffect(() => {
    const cat = searchParams.get('category')
    setSelectedCategory(cat)
  }, [searchParams])

  useEffect(() => {
    if (skipFilterRef.current) {
      skipFilterRef.current = false
      return
    }

    async function fetchFilteredNews() {
      setLoading(true)
      setError(null)
      try {
        const [pinnedData, recentData] = await Promise.all([
          withTimeout(api.getPinnedNews(selectedCategory || undefined, 5), 8000),
          withTimeout(api.getRecentNews(selectedCategory || undefined, PAGE_SIZE, 0), 8000),
        ])

        setPinnedNews(pinnedData)
        setRecentNews(recentData)
        setHasMore(recentData.length === PAGE_SIZE)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredNews()
  }, [selectedCategory, retryTrigger])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const offset = recentNews.length
      const newsData = await withTimeout(
        api.getRecentNews(selectedCategory || undefined, PAGE_SIZE, offset),
        8000
      )

      setRecentNews(prev => [...prev, ...newsData])
      setHasMore(newsData.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load more:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const renderMobileShimmer = () => (
    <div className="flex flex-col gap-4 px-4 py-4 animate-pulse">
      <div className="w-full aspect-[16/9] bg-surface-container rounded-xl" />
      <div className="space-y-2">
        <div className="h-5 bg-surface-container rounded w-3/4" />
        <div className="h-3 bg-surface-container rounded w-1/2" />
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-20 h-20 bg-surface-container rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-surface-container rounded w-1/4" />
              <div className="h-4 bg-surface-container rounded w-full" />
              <div className="h-3 bg-surface-container rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDesktopShimmer = () => (
    <div className="grid grid-cols-12 gap-8 animate-pulse">
      {/* Left Column Shimmer */}
      <div className="col-span-3 border-r border-border/60 pr-6">
        <div className="h-5 bg-surface-container rounded w-1/2 mb-5" />
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-14 h-14 bg-surface-container rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-surface-container rounded w-3/4" />
                <div className="h-3 bg-surface-container rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Column Shimmer */}
      <div className="col-span-6">
        <div className="w-full h-[400px] bg-surface-container rounded-2xl mb-6" />
        <div className="h-5 bg-surface-container rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col bg-surface-container/20 rounded-xl overflow-hidden border border-border/40">
              <div className="w-full aspect-[16/10] bg-surface-container" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-container rounded w-1/4" />
                <div className="h-4 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column Shimmer */}
      <div className="col-span-3 border-l border-border/60 pl-6">
        <div className="h-5 bg-surface-container rounded w-1/2 mb-5" />
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/60">
              <div className="w-8 h-8 bg-surface-container rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-container rounded w-1/4" />
                <div className="h-3.5 bg-surface-container rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className={`min-h-screen ${colors.background}`}>
        <Header pinnedNews={pinnedNews} categories={categories} />
        <BreakingNewsTicker pinnedNews={pinnedNews} latestNews={recentNews} />
        <CategoryBar categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
        <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-40">error_outline</span>
          <p className="text-on-surface-variant max-w-md text-sm">{error}</p>
          <button
            onClick={() => setRetryTrigger(prev => prev + 1)}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-button-hover transition-all text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const featuredNews = pinnedNews.length > 0 
    ? pinnedNews[currentSlide % pinnedNews.length] 
    : (recentNews.length > 0 ? recentNews[0] : null)

  const latestNews = (pinnedNews.length === 0 && recentNews.length > 0) 
    ? recentNews.slice(1) 
    : recentNews

  const getAuthorName = (item: NewsItem) => item.profiles?.full_name || item.profiles?.email || 'ThirdEye News'
  const formatDate = (date: string) => fmtShort(date)

  const getTimeAgo = (date: string) => timeAgo(date)

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header pinnedNews={pinnedNews} categories={categories} />
      <BreakingNewsTicker pinnedNews={pinnedNews} latestNews={recentNews} />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

      {/* Mobile Layout */}
      <main className="md:hidden">
        {loading ? renderMobileShimmer() : (
          <div className="flex flex-col gap-6 pb-8">
            {/* Hero Story Card - Featured/Pinned News */}
            {featuredNews && (
              <section className="px-4 pt-4">
                <Link key={featuredNews.id} href={`/news/${featuredNews.slug || featuredNews.id}`} className="block group">
                  <div className="relative overflow-hidden rounded-2xl aspect-[16/10] shadow-md bg-surface-container-lowest border border-border/40">
                    {featuredNews.image_url ? (
                      <>
                        <div className="relative w-full h-full">
                          <Image
                            src={featuredNews.image_url}
                            alt={featuredNews.title}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary text-on-primary text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            TOP STORY
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {featuredNews.categories && (
                            <span className="text-primary text-[10px] font-bold uppercase tracking-wide block mb-1">
                              {featuredNews.categories.name}
                            </span>
                          )}
                          <h2 className="text-white font-bold leading-tight line-clamp-2 text-lg mb-1">
                            {featuredNews.title.length > 80 ? featuredNews.title.substring(0, 80) + '...' : featuredNews.title}
                          </h2>
                          <span className="text-white/60 text-[10px] block">
                            {featuredNews.published_at && formatDate(featuredNews.published_at)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-surface-container p-5 flex flex-col justify-end">
                        <span className="bg-primary text-on-primary text-[10px] font-extrabold px-2 py-0.5 rounded self-start mb-2 tracking-wider">
                          TOP STORY
                        </span>
                        <h2 className="text-on-surface font-bold leading-tight text-lg line-clamp-3">
                          {featuredNews.title}
                        </h2>
                      </div>
                    )}
                  </div>
                </Link>
              </section>
            )}

            {/* Horizontal Recent Stories */}
            {latestNews.length > 0 && (
              <section className="flex flex-col gap-2">
                <div className="px-4 flex items-center justify-between">
                  <h3 className="text-on-surface font-bold text-[15px] uppercase tracking-wider">
                    പ്രധാന വാർത്തകൾ
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x px-4 pb-2">
                  {latestNews.slice(0, 8).map((item) => (
                    <Link key={item.id} href={`/news/${item.slug || item.id}`} className="flex flex-col shrink-0 snap-start bg-surface-container/20 border border-border/40 rounded-xl overflow-hidden p-2" style={{ width: 140 }}>
                      <div className="relative rounded-lg overflow-hidden shrink-0 aspect-[16/10] bg-surface-container">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill sizes="140px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                            <span className="material-symbols-outlined text-xl">newspaper</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 flex-1 flex flex-col justify-between">
                        <div>
                          {item.categories && (
                            <span className="text-primary text-[9px] font-bold uppercase tracking-wider block mb-1">
                              {item.categories.name}
                            </span>
                          )}
                          <p className="text-on-surface text-[11px] font-medium leading-snug line-clamp-3">
                            {item.title}
                          </p>
                        </div>
                        {item.published_at && (
                          <p className="text-on-surface-variant/60 text-[9px] mt-1.5">
                            {formatTime(item.published_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Trending Section */}
            {trendingNews.length > 0 && (
              <section className="px-4 flex flex-col gap-3">
                <h3 className="text-on-surface font-bold text-[15px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
                  ട്രെൻഡിംഗ്
                </h3>
                <div className="flex flex-col bg-surface-container/10 border border-border/30 rounded-2xl overflow-hidden divide-y divide-border/30">
                  {trendingNews.slice(0, 5).map((item, index) => (
                    <Link key={item.id} href={`/news/${item.slug || item.id}`} className="block group">
                      <div className="flex items-center gap-3 p-3 hover:bg-surface-container/20 transition-colors">
                        <div className="text-xl font-black text-outline/30 group-hover:text-primary/60 transition-colors w-6 h-6 flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div className="relative rounded-lg overflow-hidden shrink-0 aspect-[16/11] bg-surface-container w-16">
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.title} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                              <span className="material-symbols-outlined text-lg">newspaper</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-[12.5px] font-medium leading-snug line-clamp-2">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Ad Banner */}
            <section className="px-4">
              <AdBanner maxAds={2} />
            </section>

            {/* Latest News Timeline List */}
            <section className="px-4 flex flex-col gap-4">
              <h3 className="text-on-surface font-bold text-[15px] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                ഏറ്റവും പുതിയ വാർത്തകൾ
              </h3>
              <div className="flex flex-col bg-surface-container/10 border border-border/30 rounded-2xl overflow-hidden divide-y divide-border/30">
                {latestNews.length > 0 ? (
                  latestNews.map((item, index) => (
                    <Link key={item.id} href={`/news/${item.slug || item.id}`} className="block group">
                      <div className="flex gap-3 p-3 hover:bg-surface-container/20 transition-colors">
                        {item.image_url && (
                          <div className="relative flex-shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden bg-surface-container">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col justify-center flex-1 min-w-0 gap-0.5">
                          {item.categories && (
                            <span className="text-primary text-[9px] font-bold uppercase tracking-wider">
                              {item.categories.name}
                            </span>
                          )}
                          <h4 className="text-[12.5px] font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          {item.published_at && (
                            <span className="text-on-surface-variant/60 text-[9px] mt-0.5">
                              {formatDate(item.published_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-on-surface-variant text-center py-8 text-sm">വാർത്തകൾ ഇല്ല</p>
                )}
              </div>
              {hasMore && latestNews.length > 0 && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-3 bg-surface-container text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container-high transition-colors disabled:opacity-50 tracking-wider uppercase"
                >
                  {loadingMore ? 'ലോഡിംഗ്...' : 'കൂടുതൽ വാർത്തകൾ കാണാൻ'}
                </button>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Desktop Layout - 3 Column */}
      <main className="hidden md:block max-w-[1240px] mx-auto px-6 py-8">
        {loading ? renderDesktopShimmer() : (
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Live Stream Timeline (3 cols) */}
            <div className="col-span-3 border-r border-border/60 pr-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h3 className="text-on-surface text-[15px] font-bold uppercase tracking-wider">
                  ഏറ്റവും പുതിയവ (Latest)
                </h3>
              </div>
              <div className="flex flex-col gap-4 max-h-[850px] overflow-y-auto pr-2 no-scrollbar">
                {latestNews.map((item, index) => (
                  <Link key={item.id} href={`/news/${item.slug || item.id}`} className="block group">
                    <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-surface-container/40 transition-all duration-300">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 bg-surface-container">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill sizes="56px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                            <span className="material-symbols-outlined text-base">newspaper</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.categories && (
                          <span className="text-primary text-[10px] font-bold uppercase tracking-wide">
                            {item.categories.name}
                          </span>
                        )}
                        <h4 className="text-[12.5px] font-medium text-on-surface line-clamp-2 mt-0.5 leading-snug group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        {item.published_at && (
                          <span className="text-on-surface-variant/60 text-[10px] mt-1 block">
                            {formatDate(item.published_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Middle Column - Hero & Stories Grid (6 cols) */}
            <div className="col-span-6">
              {featuredNews && (
                <div className="flex flex-col gap-6">
                  {/* Main Hero Card */}
                  <Link href={`/news/${featuredNews.slug || featuredNews.id}`} className="block group">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-surface-container-lowest">
                      {featuredNews.image_url ? (
                        <div className="relative w-full h-[400px]">
                          <Image
                            src={featuredNews.image_url}
                            alt={featuredNews.title}
                            fill
                            priority
                            sizes="600px"
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-[400px] bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">newspaper</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        {featuredNews.categories && (
                          <span className="inline-block bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-3">
                            {featuredNews.categories.name}
                          </span>
                        )}
                        <h2 className="text-white text-[20px] md:text-[23px] font-bold leading-tight group-hover:underline decoration-white/40 line-clamp-2 max-w-[90%]" title={featuredNews.title}>
                          {featuredNews.title.length > 110 ? featuredNews.title.substring(0, 110) + '...' : featuredNews.title}
                        </h2>
                        {featuredNews.published_at && (
                          <p className="text-white/80 text-xs mt-2.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Sub Grid Stories */}
                  <div className="mt-2">
                    <h3 className="text-on-surface text-[15px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-secondary rounded-full"></span>
                      പ്രധാന വാർത്തകൾ (Featured Stories)
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      {latestNews.slice(0, 4).map((item) => (
                        <Link key={item.id} href={`/news/${item.slug || item.id}`} className="block group">
                          <div className="flex flex-col h-full bg-surface-container/20 rounded-xl overflow-hidden hover:bg-surface-container/50 transition-colors duration-300 border border-border/40">
                            <div className="relative aspect-[16/10] bg-surface-container">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.title}
                                  fill
                                  sizes="300px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
                                  <span className="material-symbols-outlined text-4xl">newspaper</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                {item.categories && (
                                  <span className="text-primary text-[10px] font-bold uppercase tracking-wide block mb-1">
                                    {item.categories.name}
                                  </span>
                                )}
                                <h4 className="text-[13px] font-semibold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                  {item.title}
                                </h4>
                              </div>
                              {item.published_at && (
                                <span className="text-on-surface-variant/60 text-[10px] mt-2 block">
                                  {formatDate(item.published_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Trending & Ads (3 cols) */}
            <div className="col-span-3 border-l border-border/60 pl-6">
              <h3 className="text-on-surface text-[15px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
                ട്രെൻഡിംഗ് (Trending)
              </h3>
              <div className="flex flex-col gap-4">
                {trendingNews.slice(0, 5).map((item, index) => (
                  <Link key={item.id} href={`/news/${item.slug || item.id}`} className="block group">
                    <div className="flex items-center gap-3 py-2 border-b border-border/60 group-hover:border-primary/40 transition-colors">
                      <div className="text-2xl font-black text-outline/40 group-hover:text-primary/60 transition-colors w-8 h-8 flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.categories && (
                          <span className="text-primary text-[9px] font-bold uppercase tracking-wide">
                            {item.categories.name}
                          </span>
                        )}
                        <h4 className="text-[12.5px] font-medium text-on-surface line-clamp-2 mt-0.5 leading-snug group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        {item.published_at && (
                          <span className="text-on-surface-variant/60 text-[9px] mt-1 block">
                            {formatDate(item.published_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden border border-border/60">
                <AdBanner maxAds={3} />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <WhatsAppButton />
    </div>
  )
}
