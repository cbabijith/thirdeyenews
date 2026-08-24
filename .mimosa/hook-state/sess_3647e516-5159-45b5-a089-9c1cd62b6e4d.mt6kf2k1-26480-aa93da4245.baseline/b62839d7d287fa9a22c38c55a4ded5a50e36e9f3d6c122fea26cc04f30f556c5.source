'use client'

import { useEffect, useState } from 'react'
import { api, Ad } from '@/lib/api'

interface AdBannerProps {
  maxAds?: number
  className?: string
  ads?: Ad[]
}

export function AdBanner({ maxAds = 3, className = '', ads: passedAds }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>(passedAds || [])
  const [loading, setLoading] = useState(!passedAds)

  useEffect(() => {
    if (passedAds) {
      setAds(passedAds)
      setLoading(false)
      return
    }

    async function fetchAds() {
      try {
        const data = await api.getAds('main_banner', maxAds)
        setAds(data || [])
      } catch (err) {
        console.error('Failed to load ads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [maxAds, passedAds])

  if (loading || ads.length === 0) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-2.5">
        {ads.map((ad) => (
          <AdBannerItem key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  )
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : ''
}

function AdBannerItem({ ad }: { ad: Ad }) {
  if (ad.youtube_link) {
    const embedUrl = getYouTubeEmbedUrl(ad.youtube_link)
    if (embedUrl) {
      return (
        <div className="relative w-full rounded-lg overflow-hidden bg-surface-container aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0 aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <span className="absolute top-1.5 right-1.5 text-[8px] font-medium uppercase tracking-wider bg-black/40 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded pointer-events-none z-10">
            Sponsored
          </span>
        </div>
      )
    }
  }

  if (!ad.image_url) return null

  const content = (
    <div className="relative w-full rounded-lg overflow-hidden bg-surface-container group">
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      <span className="absolute top-1.5 right-1.5 text-[8px] font-medium uppercase tracking-wider bg-black/40 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded">
        Sponsored
      </span>
    </div>
  )

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    )
  }

  return content
}
