'use client'

import { useState, useEffect, useCallback } from 'react'
import { News } from '../types'
import type { Category } from '@/features/category/types'
import { deleteImageAction } from '@/app/actions/upload'

export type SortOption = 'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc'

interface UseNewsProps {
  initialNews: News[]
  initialCategories: Category[]
  initialCount: number
}

export function useNews({ initialNews, initialCategories, initialCount }: UseNewsProps) {
  const [newsItems, setNewsItems] = useState<News[]>(initialNews)
  const [categories] = useState<Category[]>(initialCategories)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialNews.length < initialCount)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let active = true
    async function doSearch() {
      setLoading(true)
      const params = new URLSearchParams({
        search: debouncedSearchQuery,
        ...(filterCategory && { categoryId: filterCategory }),
        sortBy,
        limit: '10',
        offset: '0',
      })
      const res = await fetch(`/api/news?${params}`)
      const json = await res.json()
      if (active) {
        if (json.data) {
          setNewsItems(json.data)
          setCount(json.count)
          setHasMore(json.data.length < json.count)
        }
        setLoading(false)
      }
    }
    doSearch()
    return () => {
      active = false
    }
  }, [debouncedSearchQuery, filterCategory, sortBy])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const params = new URLSearchParams({
      search: debouncedSearchQuery,
      ...(filterCategory && { categoryId: filterCategory }),
      sortBy,
      limit: '10',
      offset: newsItems.length.toString(),
    })
    const res = await fetch(`/api/news?${params}`)
    const json = await res.json()
    if (json.data) {
      setNewsItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id))
        const newItems = json.data.filter((item: News) => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
      setCount(json.count)
      setHasMore(newsItems.length + json.data.length < json.count)
    }
    setLoadingMore(false)
  }, [debouncedSearchQuery, filterCategory, sortBy, newsItems.length, hasMore, loadingMore])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (typeof window === 'undefined') return
        const threshold = 100
        const position = window.innerHeight + window.scrollY
        const height = document.documentElement.scrollHeight
        if (position >= height - threshold && hasMore && !loadingMore && !loading) {
          loadMore()
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading, loadMore])

  const refreshNews = useCallback(async () => {
    const currentLimit = Math.max(10, newsItems.length)
    const params = new URLSearchParams({
      search: debouncedSearchQuery,
      ...(filterCategory && { categoryId: filterCategory }),
      sortBy,
      limit: currentLimit.toString(),
      offset: '0',
    })
    const res = await fetch(`/api/news?${params}`)
    const json = await res.json()
    if (json.data) {
      setNewsItems(json.data)
      setCount(json.count)
      setHasMore(json.data.length < json.count)
    }
  }, [debouncedSearchQuery, filterCategory, sortBy, newsItems.length])

  const deleteNews = useCallback(
    async (id: string) => {
      const newsItem = newsItems.find((item) => item.id === id)
      if (newsItem?.image_url) {
        try {
          await deleteImageAction(newsItem.image_url)
        } catch (error) {
          console.error('Error deleting image from storage:', error)
        }
      }
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.error) {
        alert(json.error)
        return
      }
      refreshNews()
    },
    [newsItems, refreshNews],
  )

  const togglePublish = useCallback(async (news: News) => {
    setNewsItems((prev) =>
      prev.map((item) =>
        item.id === news.id ? { ...item, is_published: !item.is_published } : item,
      ),
    )
    const res = await fetch(`/api/news/${news.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !news.is_published }),
    })
    const json = await res.json()
    if (json.error) {
      setNewsItems((prev) =>
        prev.map((item) =>
          item.id === news.id ? { ...item, is_published: news.is_published } : item,
        ),
      )
      alert(json.error)
    }
  }, [])

  const togglePin = useCallback(async (news: News) => {
    setNewsItems((prev) =>
      prev.map((item) => (item.id === news.id ? { ...item, is_pinned: !item.is_pinned } : item)),
    )
    const updates: Record<string, unknown> = { is_pinned: !news.is_pinned }
    if (!news.is_pinned && !news.published_at) {
      updates.published_at = new Date().toISOString()
    }
    const res = await fetch(`/api/news/${news.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const json = await res.json()
    if (json.error) {
      setNewsItems((prev) =>
        prev.map((item) => (item.id === news.id ? { ...item, is_pinned: news.is_pinned } : item)),
      )
      alert(json.error)
    }
  }, [])

  const createNews = useCallback(
    async (data: Omit<News, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      return json
    },
    [],
  )

  const updateNews = useCallback(async (id: string, updates: Partial<News>) => {
    const res = await fetch(`/api/news/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const json = await res.json()
    return json
  }, [])

  return {
    newsItems,
    categories,
    count,
    loading,
    loadingMore,
    hasMore,
    deleteItemId,
    setDeleteItemId,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
    showMobileFilters,
    setShowMobileFilters,
    deleteNews,
    togglePublish,
    togglePin,
    createNews,
    updateNews,
    refreshNews,
    loadMore,
  }
}
