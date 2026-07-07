const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://thirdeyenews-admin-website.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const json = await res.json()
  return json.data as T
}

async function apiPost<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const json = await res.json()
  return json as T
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
  published_at?: string | null
  is_pinned?: boolean
  is_published?: boolean
  view_count?: number
  category_id?: string | null
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
  image_url: string
  link_url: string | null
  position: string
  is_active: boolean
  display_order: number
}

export const api = {
  async getCategories(): Promise<Category[]> {
    return apiFetch<Category[]>('/api/public/categories')
  },

  async getPinnedNews(categoryId?: string, limit: number = 5): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'pinned', limit: String(limit) })
    if (categoryId) params.set('category', categoryId)
    return apiFetch<NewsItem[]>(`/api/public/news?${params}`)
  },

  async getRecentNews(categoryId?: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'recent', limit: String(limit), offset: String(offset) })
    if (categoryId) params.set('category', categoryId)
    return apiFetch<NewsItem[]>(`/api/public/news?${params}`)
  },

  async getTrendingNews(limit: number = 5): Promise<NewsItem[]> {
    const params = new URLSearchParams({ type: 'trending', limit: String(limit) })
    return apiFetch<NewsItem[]>(`/api/public/news?${params}`)
  },

  async searchNews(query: string, limit: number = 10, offset: number = 0): Promise<NewsItem[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit), offset: String(offset) })
    return apiFetch<NewsItem[]>(`/api/public/news?${params}`)
  },

  async getNewsById(id: string): Promise<NewsItem | null> {
    try {
      return await apiFetch<NewsItem>(`/api/public/news/${id}`)
    } catch {
      return null
    }
  },

  async getRelatedNews(id: string, limit: number = 4): Promise<NewsItem[]> {
    return apiFetch<NewsItem[]>(`/api/public/news/${id}/related?limit=${limit}`)
  },

  async incrementView(id: string): Promise<void> {
    try {
      await apiPost(`/api/public/news/${id}/view`)
    } catch (err) {
      console.error('Failed to increment view:', err)
    }
  },

  async getAds(position: string = 'main_banner', limit: number = 3): Promise<Ad[]> {
    return apiFetch<Ad[]>(`/api/public/ads?position=${position}&limit=${limit}`)
  },
}
