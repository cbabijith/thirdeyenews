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
          className="hover:underline flex items-center whitespace-nowrap text-gray-800 text-[13px] sm:text-[14px] font-semibold transition-all"
        >
          <span>{item.title}</span>
          <span className="material-symbols-outlined text-base ml-2 text-gray-400">chevron_right</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="w-full flex items-stretch h-11 shadow-sm relative z-10 border-b border-gray-150">
      {/* Left Fixed Section */}
      <Link
        href={`/news/${firstNews.id}`}
        className="flex items-center justify-center gap-1 px-3 bg-red-600 text-white font-bold text-[12px] sm:text-[13px] tracking-wide whitespace-nowrap flex-shrink-0 z-10"
      >
        <span className="text-yellow-400">⚡</span> BREAKING NEWS
      </Link>

      {/* Right Scrolling Section */}
      <div
        className="flex-1 bg-white overflow-hidden group"
      >
        <div className="animate-breaking-marquee flex items-center h-full group-hover:[animation-play-state:paused]">
          {renderTickerList()}
          {renderTickerList()}
        </div>
      </div>
    </div>
  )
}
