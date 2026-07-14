'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api, NewsItem } from '@/lib/api'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'
import { formatShortDate } from '@/lib/dateFormat'

const PAGE_SIZE = 10

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. Please try again.')), ms)
    )
  ]);
}

export function SearchContent() {
  const { colors } = useThemeStore()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function searchNews() {
      if (!searchQuery.trim()) {
        setResults([])
        setHasMore(false)
        setShowDropdown(false)
        return
      }

      setLoading(true)
      setError(null)
      setShowDropdown(true)
      try {
        const newsData = await withTimeout(
          api.searchNews(searchQuery.trim(), PAGE_SIZE, 0),
          8000
        )

        setResults(newsData || [])
        setHasMore((newsData || []).length === PAGE_SIZE)
      } catch (err) {
        console.error('Search failed:', err)
        setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchNews, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, retryTrigger])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const offset = results.length
      const newsData = await withTimeout(
        api.searchNews(searchQuery.trim(), PAGE_SIZE, offset),
        8000
      )

      setResults(prev => [...prev, ...(newsData || [])])
      setHasMore((newsData || []).length === PAGE_SIZE)
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header />
      
      <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-4 pb-8">
        {/* Search Input with Dropdown */}
        <div className="mb-6 relative" ref={dropdownRef}>
          <div className={`relative ${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-xl`}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Search news..."
              className="w-full pl-12 pr-12 py-3.5 bg-transparent text-on-surface placeholder:text-on-surface-variant focus:outline-none text-base"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setResults([])
                  setHasMore(false)
                  setShowDropdown(false)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${colors.surface} border ${colors.outlineVariant} rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto`}>
              {loading && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">Searching...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 px-4">
                  <p className="text-error mb-2 text-sm">{error}</p>
                  <button 
                    onClick={() => setRetryTrigger(prev => prev + 1)}
                    className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:opacity-90 transition-all shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && searchQuery && results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">No results found for "{searchQuery}"</p>
                </div>
              )}

              {!loading && !error && !searchQuery && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">Enter a search term to find news</p>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <div className="p-2">
                  <p className="text-on-surface-variant text-xs px-3 py-2">
                    Found results for "{searchQuery}"
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.slice(0, 5).map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.slug || item.id}`}
                        prefetch={false}
                        onClick={() => setShowDropdown(false)}
                        className="block"
                      >
                        <article className={`flex gap-3 ${colors.surfaceContainerLowest} hover:bg-surface-container-high p-3 rounded-lg transition-colors`}>
                          {item.image_url && (
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image src={item.image_url} alt={item.title} fill sizes="64px" className="object-cover rounded-lg" />
                            </div>
                          )}
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            {item.categories && (
                              <span className="text-primary font-label-caps text-label-caps text-xs">
                                {item.categories.name}
                              </span>
                            )}
                            <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 leading-tight">
                              {item.title}
                            </h4>
                            {item.published_at && (
                              <span className="text-on-surface-variant text-xs">
                                {formatShortDate(item.published_at)}
                              </span>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                    {results.length > 5 && (
                      <button
                        onClick={() => setShowDropdown(false)}
                        className="text-center py-2 text-primary text-xs font-medium hover:opacity-80"
                      >
                        View all {results.length} results below
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full Results List */}
        {!showDropdown && results.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant text-sm">
              Found {results.length}+ result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {results.map((item) => (
              <Link key={item.id} href={`/news/${item.slug || item.id}`} prefetch={false} className="block">
                <article className={`flex gap-4 ${colors.surfaceContainerLowest} border ${colors.outlineVariant} p-4 rounded-xl hover:shadow-md transition-shadow`}>
                  {item.image_url && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image src={item.image_url} alt={item.title} fill sizes="96px" className="object-cover rounded-lg" />
                    </div>
                  )}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {item.categories && (
                      <span className="text-primary font-label-caps text-label-caps text-xs">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                      {item.published_at && (
                        <span>
                          {formatShortDate(item.published_at)}
                        </span>
                      )}
                      {item.profiles?.full_name && (
                        <span>• {item.profiles.full_name}</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 bg-surface-container text-on-surface rounded-lg font-medium text-sm hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Results'}
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
