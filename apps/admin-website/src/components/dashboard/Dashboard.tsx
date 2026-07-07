'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { DashboardStats } from './DashboardStats'
import { useThemeStore } from '@/store/themeStore'

export function Dashboard() {
  const { colors } = useThemeStore()
  const { stats, loading } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={colors.textSecondary}>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>Dashboard</h1>
        <p className={`${colors.textSecondary} mt-1 text-sm sm:text-base`}>Overview of your news platform</p>
      </div>

      <DashboardStats
        totalNews={stats.totalNews}
        totalStaff={stats.totalStaff}
        totalUsers={stats.totalUsers}
        totalCategories={stats.totalCategories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${colors.text}`}>Recent Activity</h2>
          <p className={`${colors.textSecondary} text-sm`}>No recent activity to display</p>
        </div>
        <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow`}>
          <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${colors.text}`}>Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/content/news"
              className="block px-4 py-2 sm:px-4 sm:py-2 bg-button text-white rounded-lg hover:opacity-90 text-center text-sm sm:text-base"
            >
              Add New News
            </a>
            <a
              href="/content/categories"
              className="block px-4 py-2 sm:px-4 sm:py-2 bg-button text-white rounded-lg hover:opacity-90 text-center text-sm sm:text-base"
            >
              Add New Category
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
