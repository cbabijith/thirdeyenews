import { categoriesRepository } from '../repositories/categories.repository'
import { Category } from '../types'
import { ApiResponse } from '@/types'

export const categoriesService = {
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const data = await categoriesRepository.findAll()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch categories' }
    }
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const result = await categoriesRepository.findById(id)
      if (!result) return { data: null, error: 'Category not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch category' }
    }
  },

  async createCategory(data: { name: string; slug: string; description?: string | null }): Promise<ApiResponse<Category>> {
    try {
      const result = await categoriesRepository.create(data)
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create category' }
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      const result = await categoriesRepository.update(id, updates)
      if (!result) return { data: null, error: 'Category not found' }
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update category' }
    }
  },

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      await categoriesRepository.delete(id)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete category' }
    }
  },

  async hasRelatedNews(id: string): Promise<boolean> {
    try {
      const count = await categoriesRepository.countNewsByCategory(id)
      return count > 0
    } catch {
      return false
    }
  },

  async hasSubcategories(id: string): Promise<boolean> {
    try {
      const count = await categoriesRepository.countSubcategoriesByCategory(id)
      return count > 0
    } catch {
      return false
    }
  },

  async updateCategoryPriorities(updates: { id: string; priority: number }[]): Promise<ApiResponse<void>> {
    try {
      await categoriesRepository.updatePriorities(updates)
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update category priorities' }
    }
  },
}
