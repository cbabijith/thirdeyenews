'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import supabase from '@thirdeyenews/shared-supabase'
import { Header } from '@/components/Header'
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker'
import { CategoryBar } from '@/components/CategoryBar'
import { BottomNavBar } from '@/components/BottomNavBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { AdBanner } from '@/components/AdBanner'
import { ShimmerBox } from '@/components/Shimmer'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface NewsItem {
  id: string
  title: string
  content?: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  created_by?: string
  categories?: {
    name: string
    slug: string
  }
  profiles?: {
    full_name?: string
    email?: string
  }
}

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
        let query = supabase
          .from('news')
          .select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(PAGE_SIZE)

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory)
        }

        const { data, error } = await withTimeout(
          Promise.resolve(query),
          5000
        ) as { data: NewsItem[] | null; error: any }

        if (error) throw error

        const newsData = (data || []) as unknown as NewsItem[]

        if (selectedCategory) {
          setRecentNews(newsData.filter(item => !item.is_pinned))
          setPinnedNews(newsData.filter(item => item.is_pinned))
        } else {
          setPinnedNews(newsData.filter(item => item.is_pinned))
          setRecentNews(newsData.filter(item => !item.is_pinned).slice(0, PAGE_SIZE))
        }
        setHasMore(newsData.length === PAGE_SIZE)
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
      let query = supabase
        .from('news')
        .select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)')
        .eq('is_published', true)
        .eq('is_pinned', false)
        .order('published_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      const { data, error } = await withTimeout(Promise.resolve(query), 5000) as { data: NewsItem[] | null; error: any }

      if (error) throw error

      const newsData = (data || []) as unknown as NewsItem[]
      setRecentNews(prev => [...prev, ...newsData])
      setHasMore(newsData.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load more:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.background}`}>
        <Header categories={categories} />
        <BreakingNewsTicker />
        <div className="flex gap-2 px-4 py-3 overflow-hidden no-scrollbar">
          {[1,2,3,4,5].map(i => <ShimmerBox key={i} className="h-7 w-20 rounded-full flex-shrink-0" />)}
        </div>
        <main className="px-4 py-4 flex flex-col gap-4">
          <ShimmerBox className="w-full aspect-[16/9] rounded-xl" />
          <div className="flex flex-col gap-3">
            <ShimmerBox className="h-5 w-3/4 rounded" />
            <ShimmerBox className="h-3 w-1/2 rounded" />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-3">
                <ShimmerBox className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <ShimmerBox className="h-3 w-1/4 rounded" />
                  <ShimmerBox className="h-4 w-full rounded" />
                  <ShimmerBox className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <BottomNavBar />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-40">error_outline</span>
        <p className="text-on-surface-variant max-w-md text-sm">{error}</p>
        <button
          onClick={() => setRetryTrigger(prev => prev + 1)}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-button-hover transition-all text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  const featuredNews = pinnedNews.length > 0 ? pinnedNews[0] : null
  const latestNews = recentNews

  const getAuthorName = (item: NewsItem) => item.profiles?.full_name || item.profiles?.email || 'ThirdEye News'
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'ഇപ്പോൾ'
    if (hours < 24) return `${hours} മണിക്കൂർ മുൻപ്`
    const days = Math.floor(hours / 24)
    return `${days} ദിവസം മുൻപ്`
  }

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header pinnedNews={pinnedNews} categories={categories} />
      <BreakingNewsTicker pinnedNews={pinnedNews} latestNews={recentNews} />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

      {/* Mobile Layout */}
      <main className="md:hidden">
        {/* Hero Story Card - Featured/Pinned News */}
        {featuredNews && (
          <section className="relative overflow-hidden" style={{ height: 280 }}>
            <Link href={`/news/${featuredNews.id}`} className="block w-full h-full">
              {featuredNews.image_url ? (
                <>
                  <div className="relative w-full h-full">
                    <Image
                      src={featuredNews.image_url}
                      alt={featuredNews.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.1) 100%)',
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary text-on-primary text-xs font-bold px-2 py-1 rounded-sm">
                      TOP STORY
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-white font-bold leading-snug mb-2" style={{ fontSize: 22 }}>
                      {featuredNews.title}
                    </h2>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs opacity-80">
                        {featuredNews.published_at && formatDate(featuredNews.published_at)}
                        {featuredNews.published_at && ' | '}
                        {featuredNews.published_at && new Date(featuredNews.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {pinnedNews.length > 1 && (
                        <div className="flex gap-1">
                          {pinnedNews.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-primary' : 'bg-white opacity-50'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-surface-container h-full p-4 flex flex-col justify-center">
                  <span className="bg-primary text-on-primary text-xs font-bold px-2 py-1 rounded-sm self-start mb-2">
                    TOP STORY
                  </span>
                  <h2 className="text-on-surface font-bold leading-snug" style={{ fontSize: 22 }}>
                    {featuredNews.title}
                  </h2>
                  {featuredNews.published_at && (
                    <p className="text-on-surface-variant text-xs mt-2">
                      {formatDate(featuredNews.published_at)}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </section>
        )}

        {/* Latest News - Horizontal Scroll Cards (പ്രതൃക്ഷ വാർത്തകൾ) */}
        {latestNews.length > 0 && (
          <section>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-on-surface font-bold text-base">
                പ്രതൃക്ഷ വാർത്തകൾ
              </h3>
              <span className="text-primary text-sm font-medium flex items-center gap-1">
                എല്ലാം കാണുക
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
            <div className="px-4 pb-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
              {latestNews.slice(0, 10).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="flex flex-col" style={{ width: 115 }}>
                  <div className="rounded-md overflow-hidden" style={{ height: 75 }}>
                    {item.image_url ? (
                      <div className="relative w-full h-full">
                        <Image src={item.image_url} alt={item.title} fill sizes="115px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <div className="pt-2">
                    {item.categories && (
                      <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-sm">
                        {item.categories.name}
                      </span>
                    )}
                    <p className="text-on-surface text-xs mt-1 leading-snug line-clamp-3">
                      {item.title}
                    </p>
                    {item.published_at && (
                      <p className="text-on-surface-variant text-xs mt-1">
                        {new Date(item.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Section (ട്രെൻഡിംഗ്) */}
        {trendingNews.length > 0 && (
          <section className="px-4">
            <div className="pt-2 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface">trending_up</span>
                <h3 className="text-on-surface font-bold text-base">
                  ട്രെൻഡിംഗ്
                </h3>
              </div>
              <span className="text-primary text-sm font-medium flex items-center gap-1">
                എല്ലാം കാണുക
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
            {trendingNews.slice(0, 5).map((item, index) => (
              <Link key={item.id} href={`/news/${item.id}`} className="block group">
                <div className="flex items-center gap-3 py-3 border-b border-border">
                  <div className="bg-primary text-on-primary font-bold text-sm w-7 h-7 rounded-sm flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="rounded-md overflow-hidden shrink-0" style={{ width: 64, height: 52 }}>
                    {item.image_url ? (
                      <div className="relative w-full h-full">
                        <Image src={item.image_url} alt={item.title} fill sizes="64px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-surface-container" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-on-surface text-sm leading-snug line-clamp-2">
                      {item.title}
                    </p>
                    {item.published_at && (
                      <p className="text-on-surface-variant text-xs mt-1">
                        {getTimeAgo(item.published_at)}
                      </p>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">trending_up</span>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Ad Banner */}
        <section className="px-4 pt-4 pb-2">
          <AdBanner maxAds={3} />
        </section>

        {/* Latest News List */}
        <section className="px-4 pb-8">
          <h3 className="text-on-surface font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span>
            ഏറ്റവും പുതിയ വാർത്തകൾ
          </h3>
          <div className="flex flex-col">
            {latestNews.length > 0 ? (
              latestNews.map((item, index) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className={`flex gap-3 py-3 ${index !== latestNews.length - 1 ? 'border-b border-border' : ''}`}>
                    {item.image_url && (
                      <div className="relative flex-shrink-0 w-[72px] h-[72px]">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="72px"
                          className="object-cover rounded-md"
                        />
                        {item.youtube_link && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                            <span className="material-symbols-outlined text-white text-2xl">play_circle</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
                      {item.categories && (
                        <span className="text-primary text-[10px] font-bold uppercase tracking-wide">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="text-[14px] font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">schedule</span>
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
              className="w-full py-3 mt-4 bg-surface-container text-on-surface rounded-md font-medium text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'ലോഡിംഗ്...' : 'കൂടുതൽ വാർത്തകൾ കാണാൻ'}
            </button>
          )}
        </section>
      </main>

      {/* Desktop Layout - 3 Column */}
      <main className="hidden md:block max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Latest News (3 cols) */}
          <div className="col-span-3">
            <h3 className="text-on-surface text-[16px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              ഏറ്റവും പുതിയ വാർത്തകൾ
            </h3>
            <div className="flex flex-col gap-2">
              {latestNews.slice(0, 10).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className="p-3 rounded-lg hover:bg-surface-container transition-colors">
                    {item.categories && (
                      <span className="text-primary text-[10px] font-semibold uppercase tracking-wide">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 mt-1 leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    {item.published_at && (
                      <span className="text-on-surface-variant text-[10px] mt-1 block">
                        {formatDate(item.published_at)} • {getAuthorName(item)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Middle Column - Featured News (6 cols) */}
          <div className="col-span-6">
            {featuredNews && (
              <Link href={`/news/${featuredNews.id}`} className="block group">
                {featuredNews.image_url ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="relative w-full h-96">
                      <Image
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {featuredNews.categories && (
                        <span className="inline-block bg-secondary text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded mb-2">
                          {featuredNews.categories.name}
                        </span>
                      )}
                      <h2 className="text-white text-[28px] font-bold leading-snug">
                        {featuredNews.title}
                      </h2>
                      {featuredNews.published_at && (
                        <p className="text-white/70 text-sm mt-2">
                          {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container rounded-xl p-6">
                    {featuredNews.categories && (
                      <span className="inline-block bg-secondary text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded mb-3">
                        {featuredNews.categories.name}
                      </span>
                    )}
                    <h2 className="text-on-surface text-[28px] font-bold leading-snug">
                      {featuredNews.title}
                    </h2>
                    {featuredNews.published_at && (
                      <p className="text-on-surface-variant text-sm mt-2">
                        {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Right Column - Trending (3 cols) */}
          <div className="col-span-3">
            <h3 className="text-on-surface text-[16px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full"></span>
              ട്രെൻഡിംഗ്
            </h3>
            <div className="flex flex-col gap-3">
              {trendingNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <article className="rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 bg-surface-container">
                    {item.image_url && (
                      <div className="relative">
                        <div className="relative w-full h-32">
                          <Image src={item.image_url} alt={item.title} fill sizes="300px" className="object-cover" />
                        </div>
                        {item.youtube_link && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3">
                      {item.categories && (
                        <span className="text-primary text-[10px] font-semibold uppercase tracking-wide">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 mt-1 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] mt-1 block">
                          {formatDate(item.published_at)}
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <AdBanner maxAds={3} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <BottomNavBar />
      <WhatsAppButton />
    </div>
  )
}
