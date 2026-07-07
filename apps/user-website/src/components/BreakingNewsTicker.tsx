'use client'

import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
}

interface BreakingNewsTickerProps {
  pinnedNews?: NewsItem[]
  latestNews?: NewsItem[]
}

export function BreakingNewsTicker({ pinnedNews = [], latestNews = [] }: BreakingNewsTickerProps) {
  const allNews = [...pinnedNews, ...latestNews.slice(0, 5)]

  if (allNews.length === 0) {
    return null
  }

  const firstNews = allNews[0]

  const renderTickerList = () => (
    <div className="flex items-center gap-8 px-4">
      {allNews.map((item, index) => (
        <Link
          key={`${item.id}-${index}`}
          href={`/news/${item.id}`}
          className="hover:underline flex items-center whitespace-nowrap text-on-surface text-xs font-medium transition-all"
        >
          <span>{item.title}</span>
          <span className="material-symbols-outlined text-sm ml-2 text-on-surface-variant">chevron_right</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="w-full flex items-center bg-background border-b border-border relative z-10">
      {/* Left Fixed Section - Red Breaking News Label */}
      <Link
        href={`/news/${firstNews.id}`}
        className="bg-primary flex items-center gap-1 px-3 py-2 shrink-0 z-10"
      >
        <span className="material-symbols-outlined text-[13px] text-on-primary">bolt</span>
        <span className="text-on-primary font-bold text-xs tracking-wide whitespace-nowrap">
          BREAKING NEWS
        </span>
      </Link>

      {/* Right Scrolling Section */}
      <div className="flex-1 bg-background overflow-hidden group">
        <div className="animate-breaking-marquee flex items-center h-full group-hover:[animation-play-state:paused]">
          {renderTickerList()}
          {renderTickerList()}
        </div>
      </div>
    </div>
  )
}
