'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Subcategory } from '@/types'
import { Loader2 } from 'lucide-react'

interface NewNewsClientProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function NewNewsClient({ categories, subcategories }: NewNewsClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const createDraft = async () => {
      try {
        const res = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Untitled Article',
            content: ' ',
            is_published: false,
          }),
        })
        const json = await res.json()
        if (!active) return

        if (json.error) {
          setError(json.error)
          return
        }

        if (json.data?.id) {
          router.replace(`/content/news/edit/${json.data.id}`)
        } else {
          setError('Failed to initialize draft article ID.')
        }
      } catch (err) {
        if (active) {
          setError('An unexpected error occurred while creating draft.')
        }
      }
    }

    createDraft()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
      {error ? (
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Initializing draft article...</p>
        </>
      )}
    </div>
  )
}

