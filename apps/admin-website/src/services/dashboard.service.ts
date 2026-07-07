import { newsRepository } from '@/features/news/repositories/news.repository'
import { categoriesRepository } from '@/features/category'
import { profilesRepository } from '@/repositories/profiles.repository'

export interface DashboardStats {
  totalNews: number
  totalStaff: number
  totalUsers: number
  totalCategories: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const [newsItems, categories, staff, users] = await Promise.all([
        newsRepository.findPublished(),
        categoriesRepository.findAll(),
        profilesRepository.findByRole('staff'),
        profilesRepository.findByRole('user'),
      ])

      return {
        totalNews: newsItems.length,
        totalStaff: staff.length,
        totalUsers: users.length,
        totalCategories: categories.length,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalNews: 0,
        totalStaff: 0,
        totalUsers: 0,
        totalCategories: 0,
      }
    }
  },
}
