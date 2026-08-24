'use client'

import { useState } from 'react'

interface ShareButtonProps {
  onShare: () => void
  positionClass?: string
}

export function ShareButton({ onShare, positionClass = 'bottom-6 right-4' }: ShareButtonProps) {
  const [showLabel, setShowLabel] = useState(false)

  return (
    <div className={`fixed z-50 ${positionClass}`}>
      <button
        onClick={onShare}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        className="flex items-center gap-2 bg-button text-on-primary pl-4 pr-4 py-3 rounded-full shadow-lg hover:bg-button-hover transition-all active:scale-95"
        aria-label="Share article"
      >
        <span className="material-symbols-outlined text-[20px] flex-shrink-0" style={{ fontVariationSettings: 'FILL 1' }}>
          share
        </span>
        {showLabel && (
          <span className="text-sm font-medium whitespace-nowrap">പങ്കിടുക</span>
        )}
      </button>
    </div>
  )
}
