'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
      <span className="material-symbols-outlined text-6xl text-gray-400">error_outline</span>
      <h2 className="text-lg font-semibold text-gray-700">എന്തോ പ്രശ്നമുണ്ട്</h2>
      <p className="text-sm text-gray-500 max-w-md">
        പേജ് ലോഡ് ചെയ്യുന്നതിൽ എറർ സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#cc0000] text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
      >
        വീണ്ടും ശ്രമിക്കുക
      </button>
    </div>
  )
}
