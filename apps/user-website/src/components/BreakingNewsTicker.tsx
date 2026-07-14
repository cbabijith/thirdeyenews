'use client'

import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  slug?: string | null
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

  const renderTickerList = () => (
    <div className="flex items-center gap-4">
      {allNews.map((item, index) => (
        <Link
          key={`${item.id}-${index}`}
          href={`/news/${item.slug || item.id}`}
          prefetch={false}
          className="hover:text-primary flex items-center whitespace-nowrap text-on-surface text-[12px] font-semibold transition-colors"
        >
          <span>{item.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30 mx-6 shrink-0" />
        </Link>
      ))}
    </div>
  )

  return (
    <div className="w-full flex items-center bg-surface-container-lowest border-b border-border/30 h-9 relative z-10 px-4">
      {/* Pulse Dot Indicator + Label */}
      <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border/40 mr-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-primary font-black text-[10px] uppercase tracking-[0.18em] whitespace-nowrap">
          LIVE
        </span>
      </div>

      {/* Right Scrolling Section */}
      <div className="flex-1 overflow-hidden group">
        <div className="animate-breaking-marquee flex items-center h-full group-hover:[animation-play-state:paused]">
          {renderTickerList()}
          {renderTickerList()}
        </div>
      </div>
    </div>
  )
}
