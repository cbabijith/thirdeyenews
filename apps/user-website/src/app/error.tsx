'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
    const body = JSON.stringify({ message: error.message, digest: error.digest, path: window.location.pathname })
    void fetch('/api/client-errors', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
      <span className="material-symbols-outlined text-6xl text-gray-400">error_outline</span>
      <h2 className="text-lg font-semibold text-gray-700">എന്തോ പ്രശ്നമുണ്ട്</h2>
      <p className="text-sm text-gray-500 max-w-md">
        പേജ് ലോഡ് ചെയ്യുന്നതിൽ എറർ സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 bg-[#cc0000] text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
      >
        വീണ്ടും ശ്രമിക്കുക
      </button>
      <Link href="/" className="text-sm underline text-gray-600">ഹോം പേജിലേക്ക്</Link>
    </div>
  )
}
