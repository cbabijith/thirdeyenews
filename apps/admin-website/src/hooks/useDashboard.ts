'use client'

import { useState, useEffect } from 'react'
import type { DashboardStats } from '@/services/dashboard.service'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    publishedCount: 0,
    draftCount: 0,
    totalViews: 0,
    viewsToday: 0,
    viewsYesterday: 0,
    viewsThisWeek: 0,
    viewsThisMonth: 0,
    totalCategories: 0,
    topViewed: [],
  })
  const [timeframe, setTimeframe] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (stats.totalViews === 0) {
        setLoading(true)
      } else {
        setStatsLoading(true)
      }
      try {
        const res = await fetch(`/api/dashboard?timeframe=${timeframe}`)
        if (!res.ok) {
          console.error('Error fetching dashboard stats:', res.status)
          return
        }
        const json = await res.json()
        if (json.data) {
          setStats(json.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [timeframe])

  return { stats, loading, statsLoading, timeframe, setTimeframe }
}
