'use client'

import { useEffect, useRef, useState } from 'react'

// Versioned filenames: served with immutable caching, so replace the video by
// shipping a new file (e.g. promo-video-v3.mp4) and updating VIDEO_SRC/POSTER_SRC.
const VIDEO_SRC = '/ads/promo-video-v2.mp4'
const POSTER_SRC = '/ads/promo-video-v2-poster.webp'

// Delay before the video starts downloading so it never competes with the
// article's initial load (LCP, images) for bandwidth.
const LOAD_DELAY_MS = 2000

export function FloatingVideoAd() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Respect reduced-motion users and data-saver preferences: keep poster only.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (reducedMotion || saveData) return

    const timer = setTimeout(() => setShouldLoad(true), LOAD_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!shouldLoad) return
    const video = videoRef.current
    if (!video) return

    // Sound must always be on. Browsers block autoplay-with-sound until the
    // user has interacted with the page, so: try unmuted autoplay first, and
    // if the browser rejects it, start muted and switch sound on at the
    // user's first tap/click/keypress anywhere.
    const play = async () => {
      video.muted = false
      try {
        await video.play()
      } catch {
        video.muted = true
        video.play().catch(() => {})
      }
    }
    play()

    const unmute = () => {
      if (video.muted) {
        video.muted = false
        video.play().catch(() => {})
      }
    }
    window.addEventListener('pointerdown', unmute)
    window.addEventListener('keydown', unmute)

    // Pause while the tab is hidden to save battery/CPU; the loop is fully
    // buffered after the first play, so no repeated downloads.
    const handleVisibility = () => {
      if (document.hidden) {
        video.pause()
      } else {
        video.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pointerdown', unmute)
      window.removeEventListener('keydown', unmute)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [shouldLoad])

  return (
    <div
      className="fixed bottom-3 right-3 z-40 w-[110px] md:w-[150px] md:bottom-6 md:right-6 select-none pointer-events-none"
      role="region"
      aria-label="Sponsored video"
    >
      <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10 bg-surface-container">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={shouldLoad ? VIDEO_SRC : undefined}
          poster={POSTER_SRC}
          loop
          playsInline
          autoPlay
          preload="none"
          disablePictureInPicture
          aria-label="Advertisement video"
        />
        <span className="absolute top-1.5 left-1.5 text-[8px] font-medium uppercase tracking-wider bg-black/40 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded pointer-events-none">
          Ad
        </span>
      </div>
    </div>
  )
}
