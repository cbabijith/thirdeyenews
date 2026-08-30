'use client'

import { useEffect, useState } from 'react'
import { api, Ad } from '@/lib/api'

export function BottomNavAd() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAd() {
      try {
        const data = await api.getAds('bottom_nav', 1)
        if (data && data.length > 0) {
          setAd(data[0])
        }
      } catch (err) {
        console.error('Failed to load bottom nav ad:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [])

  if (loading || !ad) {
    return null
  }

  const content = (
    <div className="relative w-full h-12 flex items-center justify-center rounded-md overflow-hidden bg-surface-container flex-shrink-0">
      <img
        src={ad.image_url || undefined}
        alt={ad.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-12 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    )
  }

  return content
}
