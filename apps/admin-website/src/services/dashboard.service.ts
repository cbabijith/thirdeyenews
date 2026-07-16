import { newsRepository } from '@/features/news/repositories/news.repository'
import { categoriesRepository } from '@/features/category'
import type { News } from '@/features/news/types'

export interface DashboardStats {
  publishedCount: number
  draftCount: number
  totalViews: number
  viewsToday: number
  viewsYesterday: number
  viewsThisWeek: number
  viewsThisMonth: number
  totalCategories: number
  topViewed: Pick<News, 'id' | 'title' | 'view_count' | 'is_published' | 'created_at' | 'categories' | 'profiles'>[]
}

export const dashboardService = {
  async getStats(timeframe: 'today' | 'yesterday' | 'week' | 'month' | 'all' = 'all'): Promise<DashboardStats> {
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const yesterdayStart = new Date()
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)
      yesterdayStart.setHours(0, 0, 0, 0)

      const yesterdayEnd = new Date()
      yesterdayEnd.setHours(0, 0, 0, 0)

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      weekStart.setHours(0, 0, 0, 0)

      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      monthStart.setHours(0, 0, 0, 0)

      const [
        publishedCount,
        draftCount,
        totalViews,
        viewsToday,
        viewsYesterday,
        viewsThisWeek,
        viewsThisMonth,
        totalCategories,
        topViewed
      ] = await Promise.all([
        newsRepository.countPublished(),
        newsRepository.countDrafts(),
        newsRepository.getTotalViews(),
        newsRepository.getViewsCountSince(todayStart),
        newsRepository.getViewsCountBetween(yesterdayStart, yesterdayEnd),
        newsRepository.getViewsCountSince(weekStart),
        newsRepository.getViewsCountSince(monthStart),
        categoriesRepository.findAll().then(c => c.length),
        newsRepository.findTopViewedByTimeframe(timeframe, 5),
      ])

      return {
        publishedCount,
        draftCount,
        totalViews,
        viewsToday,
        viewsYesterday,
        viewsThisWeek,
        viewsThisMonth,
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
        viewsToday: 0,
        viewsYesterday: 0,
        viewsThisWeek: 0,
        viewsThisMonth: 0,
        totalCategories: 0,
        topViewed: [],
      }
    }
  },
}
