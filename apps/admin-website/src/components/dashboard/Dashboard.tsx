'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { DashboardStats } from './DashboardStats'
import { Eye, Pencil, Plus, Folder, Megaphone } from 'lucide-react'

export function Dashboard() {
  const { stats, loading, statsLoading, timeframe, setTimeframe } = useDashboard()

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
        <div className="h-7 bg-gray-100 rounded w-32 animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Content performance overview</p>
      </div>

      <DashboardStats
        publishedCount={stats.publishedCount}
        draftCount={stats.draftCount}
        totalViews={stats.totalViews}
        viewsToday={stats.viewsToday}
        viewsYesterday={stats.viewsYesterday}
        viewsThisWeek={stats.viewsThisWeek}
        viewsThisMonth={stats.viewsThisMonth}
        totalCategories={stats.totalCategories}
      />

      {/* Top Viewed Articles */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Top Viewed Articles</h2>
          <div className="flex items-center gap-2">
            {statsLoading && (
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            )}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 text-xs font-medium text-gray-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-gray-400 transition-colors"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          {stats.topViewed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-400 text-sm">No published articles yet</p>
            </div>
          ) : (
            stats.topViewed.map((article, index) => (
              <div
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-4 p-3">
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-sm font-bold text-gray-400 flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={article.title}>
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {article.categories?.name || 'Uncategorized'}
                      {article.profiles?.email ? ` · ${article.profiles.email.split('@')[0]}` : ''}
                      {' · '}
                      {new Date(article.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium">{article.view_count || 0}</span>
                  </div>

                  {/* Edit link */}
                  <a
                    href={`/content/news/edit/${article.id}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors flex-shrink-0"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href="/content/news/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Article
        </a>
        <a
          href="/content/categories"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <Folder className="w-4 h-4" />
          Categories
        </a>
        <a
          href="/content/ads"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <Megaphone className="w-4 h-4" />
          Ads
        </a>
      </div>
    </div>
  )
}
