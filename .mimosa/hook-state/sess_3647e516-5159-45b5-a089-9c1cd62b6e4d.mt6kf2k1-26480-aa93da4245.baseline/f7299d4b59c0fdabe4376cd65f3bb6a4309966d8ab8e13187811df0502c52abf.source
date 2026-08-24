import { Suspense } from 'react'
import { SearchContent } from './SearchContent'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
