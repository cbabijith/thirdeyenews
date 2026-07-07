// Role Types
export type UserRole = 'admin' | 'staff' | 'user'

import type { Category, Subcategory } from '@/features/category/types'
export type { Category, Subcategory }

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type AdPosition = 'main_banner' | 'bottom_nav'

export interface Ad {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: AdPosition
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

import type { News } from '@/features/news/types'
export type { News }

export interface Comment {
  id: string
  news_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Like {
  id: string
  news_id: string
  user_id: string
  created_at: string
}

// Auth Types
export interface User {
  id: string
  email: string
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
