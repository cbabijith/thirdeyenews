'use client'

import Link from 'next/link'
import type { Category, Subcategory } from '@/features/category/types'
import { News } from '../types'
import { useNews } from '../hooks/useNews'
import { Search, Plus, Pin, Globe, Eye, Pencil, Trash2, ImageOff, Video, ChevronDown, X } from 'lucide-react'

interface NewsClientProps {
  initialNews: News[]
  initialCategories: Category[]
  initialSubcategories: Subcategory[]
  initialCount: number
}

export function NewsClient({
  initialNews,
  initialCategories,
  initialCount
}: NewsClientProps) {
  const {
    newsItems,
    categories,
    count,
    loading,
    loadingMore,
    deleteItemId,
    setDeleteItemId,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    deleteNews,
    togglePublish,
    togglePin,
  } = useNews({ initialNews, initialCategories, initialCount })

  return (
    <div className="px-4 sm:px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count} articles total</p>
        </div>
        <Link
          href="/content/news/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-9 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none pl-3 pr-9 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer transition-colors"
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="views-desc">Most Viewed</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading && newsItems.length === 0 ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No articles found</p>
          </div>
        ) : (
          <>
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4 p-3">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageOff className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                        item.is_published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {item.is_published ? 'Live' : 'Draft'}
                      </span>
                      {item.is_pinned && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-700 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          Pinned
                        </span>
                      )}
                      {item.youtube_link && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-red-50 text-red-700 flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" />
                          Video
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {item.view_count || 0}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.categories?.name || 'Uncategorized'} · {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        item.is_published
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.is_published ? 'Unpublish' : 'Publish'}
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePin(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        item.is_pinned
                          ? 'text-indigo-600 hover:bg-indigo-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/content/news/edit/${item.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteItemId(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {loadingMore && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                  Loading more...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteItemId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete article?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the article and its image. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteItemId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteItemId
                  setDeleteItemId(null)
                  await deleteNews(id)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
