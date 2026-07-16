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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard')
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
      }
    }
    fetchStats()
  }, [])

  return { stats, loading }
}
