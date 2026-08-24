import { newsRepository } from '../repositories/news.repository'
import { News, NewsSearchParams, NewsSearchResult } from '../types'
import { ApiResponse } from '@/types'

async function resolveUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let baseSlug = slug
  let suffix = 0

  // If the slug already ends with -<number>, parse it
  const match = slug.match(/(.*)-(\d+)$/)
  if (match) {
    baseSlug = match[1]
    suffix = parseInt(match[2], 10)
  }

  let currentSlug = slug
  while (true) {
    const exists = await newsRepository.isSlugExists(currentSlug, excludeId)
    if (!exists) {
      return currentSlug
    }
    suffix++
    currentSlug = `${baseSlug}-${suffix}`
  }
}

export const newsService = {
  async getAllNews(includeCategory = true): Promise<ApiResponse<News[]>> {
    try {
      const data = await newsRepository.findAll(includeCategory)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch news' }
    }
  },

  async getNewsById(id: string, includeCategory = true): Promise<ApiResponse<News>> {
    try {
      const result = await newsRepository.findById(id, includeCategory)
      if (!result) return { data: null, error: 'News not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch news' }
    }
  },

  async getNewsByCategory(categoryId: string): Promise<ApiResponse<News[]>> {
    try {
      const data = await newsRepository.findByCategory(categoryId)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch news by category' }
    }
  },

  async getPublishedNews(): Promise<ApiResponse<News[]>> {
    try {
      const data = await newsRepository.findPublished()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch published news' }
    }
  },

  async getNewsForListPage(limit: number, offset: number): Promise<{ data: News[]; count: number }> {
    try {
      const [data, totalCount] = await Promise.all([
        newsRepository.findAllWithRelations(limit, offset),
        newsRepository.count(),
      ])
      return { data, count: totalCount }
    } catch (error) {
      console.error('Error in getNewsForListPage:', error)
      return { data: [], count: 0 }
    }
  },

  async createNews(data: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<News>> {
    try {
      const finalData = { ...data }
      if (finalData.slug) {
        finalData.slug = await resolveUniqueSlug(finalData.slug)
      }
      const result = await newsRepository.create(finalData)
      return { data: result, error: null }
    } catch (error) {
      const msg = error instanceof Error ? error.message : ''
      if (msg.includes('news_slug_key') || (msg.includes('duplicate key') && msg.includes('slug'))) {
        return { data: null, error: 'This custom slug is already in use by another article. Please choose a different slug name.' }
      }
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create news' }
    }
  },

  async updateNews(id: string, updates: Partial<News>): Promise<ApiResponse<News>> {
    try {
      const finalUpdates = { ...updates }
      if (finalUpdates.slug) {
        finalUpdates.slug = await resolveUniqueSlug(finalUpdates.slug, id)
      }
      const result = await newsRepository.update(id, finalUpdates)
      if (!result) return { data: null, error: 'News not found' }
      return { data: result, error: null }
    } catch (error) {
      const msg = error instanceof Error ? error.message : ''
      if (msg.includes('news_slug_key') || (msg.includes('duplicate key') && msg.includes('slug'))) {
        return { data: null, error: 'This custom slug is already in use by another article. Please choose a different slug name.' }
      }
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update news' }
    }
  },

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    try {
      await newsRepository.delete(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete news' }
    }
  },

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResponse<News>> {
    try {
      const result = await newsRepository.updatePublishStatus(id, isPublished)
      if (!result) return { data: null, error: 'News not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to toggle publish status' }
    }
  },

  async searchNews(params: NewsSearchParams): Promise<NewsSearchResult> {
    try {
      return await newsRepository.search(params)
    } catch (error) {
      console.error('Error in searchNews:', error)
      return {
        data: [],
        count: 0,
      }
    }
  },
}
