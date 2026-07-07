'use client'

import { useState, useEffect } from 'react'
import type { DashboardStats } from '@/services/dashboard.service'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNews: 0,
    totalStaff: 0,
    totalUsers: 0,
    totalCategories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard')
        const json = await res.json()
        if (json.data) {
          setStats(json.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  return { stats, loading }
}
