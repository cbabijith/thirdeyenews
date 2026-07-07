import { newsRepository } from '@/features/news/repositories/news.repository'
import { categoriesRepository } from '@/features/category'
import type { News } from '@/features/news/types'

export interface DashboardStats {
  publishedCount: number
  draftCount: number
  totalViews: number
  totalCategories: number
  topViewed: Pick<News, 'id' | 'title' | 'view_count' | 'is_published' | 'created_at' | 'categories' | 'profiles'>[]
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const [publishedCount, draftCount, totalViews, totalCategories, topViewed] = await Promise.all([
        newsRepository.countPublished(),
        newsRepository.countDrafts(),
        newsRepository.getTotalViews(),
        categoriesRepository.findAll().then(c => c.length),
        newsRepository.findTopViewed(5),
      ])

      return {
        publishedCount,
        draftCount,
        totalViews,
        totalCategories,
        topViewed: topViewed.map(n => ({
          id: n.id,
          title: n.title,
          view_count: n.view_count,
          is_published: n.is_published,
          created_at: n.created_at,
          categories: n.categories,
          profiles: n.profiles,
        })),
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        publishedCount: 0,
        draftCount: 0,
        totalViews: 0,
        totalCategories: 0,
        topViewed: [],
      }
    }
  },
}
