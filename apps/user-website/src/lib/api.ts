import { ApiError, fetchJson } from './http'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const server = typeof window === 'undefined'
  const base = server ? (process.env.ADMIN_API_URL || 'https://admin.thirdeyenewslive.com') : ''
  const fullPath = server ? path.replace(/^\/api\//, '/api/public/') : path
  const json = await fetchJson<{ data: T; error?: string }>(`${base}${fullPath}`, {
    ...options,
    headers: server ? { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN || process.env.API_ACCESS_TOKEN || ''}` } : undefined,
    ...(server ? { next: { revalidate: 60, tags: ['public-content'] } } : { cache: 'no-store' }),
  })
  if (json.error || !('data' in json)) throw new ApiError('Invalid content service response', 502)
  return json.data
}

async function apiPost(path: string): Promise<unknown> {
  return fetchJson(path, { method: 'POST', cache: 'no-store' })
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface NewsItem {
  id: string
  title: string
  content?: string | null
  description?: string | null
  image_url?: string | null
  youtube_link?: string | null
  created_at?: string | null
  updated_at?: string | null
  published_at?: string | null
  is_pinned?: boolean
  is_published?: boolean
  view_count?: number
  category_id?: string | null
  slug?: string | null
  ad_image_url?: string | null
  ad_link_url?: string | null
  categories?: {
    name: string
    slug: string
  }
  profiles?: {
    full_name?: string | null
    email?: string | null
  }
}

export interface Ad {
  id: string
  title: string
  image_url: string | null
  link_url: string | null
  youtube_link: string | null
  position: string
  is_active: boolean
  display_order: number
}

export const api = {
  async getSitemapPage(page: number): Promise<{ articles: { id: string; slug: string | null; updated_at: string }[]; total: number; categories: { id: string }[] }> {
    return apiFetch(`/api/sitemap?page=${page}`)
  },
  async getCategories(): Promise<Category[]> {
    return apiFetch<Category[]>('/api/categories')
  },

  async getPinnedNews(categoryId?: string, limit: number = 5): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'pinned', limit: String(limit) })
    if (categoryId) params.set('category', categoryId)
    return apiFetch<NewsItem[]>(`/api/news?${params}`)
  },

  async getRecentNews(categoryId?: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'recent', limit: String(limit), offset: String(offset) })
    if (categoryId) params.set('category', categoryId)
    return apiFetch<NewsItem[]>(`/api/news?${params}`)
  },

  async getTrendingNews(limit: number = 5): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'trending', limit: String(limit) })
    return apiFetch<NewsItem[]>(`/api/news?${params}`)
  },

  async searchNews(query: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
    return apiFetch<NewsItem[]>(`/api/news?${params}`)
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    try {
      return await apiFetch<NewsItem>(`/api/news/${encodeURIComponent(id)}`)
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
      return null
    }
  },

  async getRelatedNews(id: string, limit: number = 4): Promise<NewsItem[]> {
    return apiFetch<NewsItem[]>(`/api/news/${encodeURIComponent(id)}/related?limit=${limit}`)
  },

  async getAdjacentNews(id: string): Promise<{ prev: NewsItem | null; next: NewsItem | null }> {
    return apiFetch<{ prev: NewsItem | null; next: NewsItem | null }>(`/api/news/${encodeURIComponent(id)}/adjacent`)
  },

  async incrementView(id: string): Promise<void> {
    try {
      await apiPost(`/api/news/${encodeURIComponent(id)}/view`)
    } catch (err) {
      console.error('Failed to increment view:', err)
    }
  },

  async getAds(position: string = 'main_banner', limit: number = 3): Promise<Ad[]> {
    return apiFetch<Ad[]>(`/api/ads?position=${encodeURIComponent(position)}&limit=${limit}`)
  },
}
