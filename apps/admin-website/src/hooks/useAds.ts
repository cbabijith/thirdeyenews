'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ad } from '@/types'
import { deleteImageAction } from '@/app/actions/upload'

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ads')
      const json = await res.json()
      if (json.data) {
        setAds(json.data)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  const toggleActive = useCallback(async (ad: Ad) => {
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !ad.is_active }),
    })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      return
    }
    setAds((prev) =>
      prev.map((item) =>
        item.id === ad.id ? { ...item, is_active: !item.is_active } : item,
      ),
    )
  }, [])

  const deleteAd = useCallback(async (id: string) => {
    const ad = ads.find((item) => item.id === id)
    if (ad?.image_url) {
      try {
        await deleteImageAction(ad.image_url)
      } catch (error) {
        console.error('Error deleting ad image:', error)
      }
    }
    const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      return
    }
    setAds((prev) => prev.filter((item) => item.id !== id))
  }, [ads])

  return {
    ads,
    loading,
    deleteItemId,
    setDeleteItemId,
    toggleActive,
    deleteAd,
    refreshAds: fetchAds,
  }
}
