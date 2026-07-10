'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category, Subcategory } from '@/features/category/types'
import { News } from '../types'
import { useNews } from '../hooks/useNews'
import { Search, Plus, Pin, Globe, Eye, Pencil, Trash2, Video, ChevronDown, X, Folder, ArrowUpDown, MoreVertical, ExternalLink, Newspaper } from 'lucide-react'

function stripHtml(html: string): string {
  return html
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildWhatsAppShareUrl(item: News): string {
  const title = item.title
  const link = `https://thirdeyenewslive.com/news/${item.id}`

  const text = `*${title}*\n\n${link}\n\n🩸വാർത്തകൾ ഡെയ്ലി ഹണ്ടിൽ  വായിക്കുവാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://profile.dailyhunt.in/thirdeyenewslive\n\n🟣വാർത്തകൾ വാട്സ് ആപ്പിൽ അതിവേഗമറിയാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക\nhttps://chat.whatsapp.com/EDpxcoLm36sGvoGLYlv4b9`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

interface NewsClientProps {
  initialNews: News[]
  initialCategories: Category[]
  initialSubcategories: Subcategory[]
  initialCount: number
}

function isEmail(title: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(title.trim())
}

function getDisplayTitle(item: News): string {
  if (!item.title || isEmail(item.title)) return 'Untitled Article'
  return item.title
}

function truncateTitle(title: string, max = 62): string {
  if (title.length <= max) return title
  return title.slice(0, max).trimEnd() + '...'
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

  const [moreMenuId, setMoreMenuId] = useState<string | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">News</h1>
          <p className="text-xs text-gray-500 mt-0.5">{count} articles total</p>
        </div>
        <Link
          href="/content/news/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        {/* Search - takes most space */}
        <div className="relative flex-1 sm:min-w-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-10 pl-9 pr-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
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

        {/* Filters row */}
        <div className="flex gap-2">
          {/* Category filter with icon */}
          <div className="relative flex-1 sm:flex-initial">
            <Folder className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none w-full h-10 pl-8 pr-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort with icon */}
          <div className="relative flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full h-10 pl-8 pr-9 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 cursor-pointer transition-colors"
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
      </div>

      {/* Compact Newsroom List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading && newsItems.length === 0 ? (
          <div className="divide-y divide-gray-100">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="w-14 h-10 bg-gray-100 rounded flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
                <div className="h-5 w-12 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No articles found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                {/* Thumbnail - 56x42 compact */}
                <div className="w-14 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                      <Newspaper className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Info - title + meta */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[13px] font-bold text-gray-900 leading-snug truncate group-hover:text-gray-700"
                    title={getDisplayTitle(item)}
                  >
                    {truncateTitle(getDisplayTitle(item))}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400 font-normal truncate overflow-hidden flex-nowrap">
                    <span className="font-medium text-gray-500 flex-shrink-0">{item.categories?.name || 'Uncategorized'}</span>
                    <span className="flex-shrink-0">·</span>
                    <span className="flex-shrink-0">{new Date(item.created_at).toLocaleDateString('en-GB')}</span>
                    <span className="flex-shrink-0">·</span>
                    <span className="flex items-center gap-0.5 flex-shrink-0">
                      <Eye className="w-2.5 h-2.5" />
                      {item.view_count || 0}
                    </span>
                    {item.is_pinned && (
                      <span className="flex items-center gap-0.5 text-indigo-500 flex-shrink-0" title="Pinned">
                        <Pin className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {item.youtube_link && (
                      <span className="flex items-center gap-0.5 text-red-500 flex-shrink-0" title="Has Video">
                        <Video className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0 hidden sm:block">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.is_published
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.is_published ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Actions - WhatsApp Share + More menu */}
                <div className="flex items-center gap-1 flex-shrink-0 relative">
                  <button
                    onClick={() => window.open(buildWhatsAppShareUrl(item), '_blank')}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-green-600 hover:bg-green-50 transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setMoreMenuId(moreMenuId === item.id ? null : item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    title="More actions"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown menu */}
                  {moreMenuId === item.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMoreMenuId(null)} />
                      <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                        <Link
                          href={`/content/news/edit/${item.id}`}
                          onClick={() => setMoreMenuId(null)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-400" />
                          Edit
                        </Link>
                        <button
                          onClick={() => { togglePublish(item); setMoreMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          {item.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => { togglePin(item); setMoreMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pin className="w-3.5 h-3.5 text-gray-400" />
                          {item.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={() => { window.open(`https://thirdeyenewslive.com/news/${item.id}`, '_blank'); setMoreMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          View on Site
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => { setDeleteItemId(item.id); setMoreMenuId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {loadingMore && (
              <div className="text-center py-3">
                <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                  Loading more...
                </div>
              </div>
            )}
          </div>
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
