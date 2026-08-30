import { subcategoriesRepository } from '../repositories/subcategories.repository'
import { Subcategory } from '../types'
import { ApiResponse } from '@/types'

export const subcategoriesService = {
  async getAllSubcategories(): Promise<ApiResponse<Subcategory[]>> {
    try {
      const data = await subcategoriesRepository.findAll()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch subcategories' }
    }
  },

  async getSubcategoriesByCategory(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    try {
      const data = await subcategoriesRepository.findByCategory(categoryId)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch subcategories by category' }
    }
  },

  async getSubcategoryById(id: string): Promise<ApiResponse<Subcategory>> {
    try {
      const result = await subcategoriesRepository.findById(id)
      if (!result) return { data: null, error: 'Subcategory not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch subcategory' }
    }
  },

  async createSubcategory(data: {
    category_id: string
    name: string
    slug: string
    description?: string | null
  }): Promise<ApiResponse<Subcategory>> {
    try {
      const result = await subcategoriesRepository.create(data)
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create subcategory' }
    }
  },

  async updateSubcategory(
    id: string,
    updates: Partial<Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<ApiResponse<Subcategory>> {
    try {
      const result = await subcategoriesRepository.update(id, updates)
      if (!result) return { data: null, error: 'Subcategory not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update subcategory' }
    }
  },

  async deleteSubcategory(id: string): Promise<ApiResponse<void>> {
    try {
      await subcategoriesRepository.delete(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete subcategory' }
    }
  },

  async hasRelatedNews(id: string): Promise<boolean> {
    try {
      const count = await subcategoriesRepository.countNewsBySubcategory(id)
      return count > 0
    } catch {
      return false
    }
  },
}
