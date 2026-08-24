'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Ad } from '../types'
import { storageService } from '@/services/storage.service'

export function useAds(initialAds: Ad[] = []) {
  const [ads, setAds] = useState<Ad[]>(initialAds)
  const [loading, setLoading] = useState(initialAds.length === 0)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const isFirstMount = useRef(true)

  const fetchAds = useCallback(async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setLoading(true)
    }
    try {
      const res = await fetch('/api/ads')
      if (!res.ok) {
        console.error('Error fetching ads:', res.status)
        setAds([])
        setLoading(false)
        return
      }
      const json = await res.json()
      if (json.data) {
        setAds(json.data)
      } else if (json.error) {
        console.error('Error fetching ads:', json.error)
        setAds([])
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
      setAds([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      if (initialAds.length > 0) {
        return
      }
    }
    fetchAds()
  }, [fetchAds, initialAds.length])

  const toggleActive = useCallback(async (ad: Ad) => {
    setAds((prev) =>
      prev.map((item) =>
        item.id === ad.id ? { ...item, is_active: !item.is_active } : item,
      ),
    )
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !ad.is_active }),
    })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      setAds((prev) =>
        prev.map((item) =>
          item.id === ad.id ? { ...item, is_active: ad.is_active } : item,
        ),
      )
    }
  }, [])

  const deleteAd = useCallback(async (id: string) => {
    const ad = ads.find((item) => item.id === id)
    setAds((prev) => prev.filter((item) => item.id !== id))
    if (ad?.image_url) {
      try {
        await storageService.deleteImage(ad.image_url)
      } catch (error) {
        console.error('Error deleting ad image:', error)
      }
    }
    const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.error) {
      alert(json.error)
      fetchAds()
    }
  }, [ads, fetchAds])

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
