import type { Category } from '@/features/category/types'
import type { Subcategory } from '@/features/category/types'
import type { Profile } from '@/types'

export interface News {
  id: string
  title: string
  description: string | null
  content: string | null
  image_url: string | null
  youtube_link: string | null
  category_id: string | null
  subcategory_id: string | null
  is_published: boolean
  is_pinned: boolean
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
  created_by: string | null
  categories?: Category
  subcategories?: Subcategory
  profiles?: Profile
}

export interface NewsSearchParams {
  searchQuery?: string
  categoryId?: string
  sortBy?: 'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc'
  limit: number
  offset: number
}

export interface NewsSearchResult {
  data: News[]
  count: number
}
