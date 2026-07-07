'use client'

import { useRouter } from 'next/navigation'
import { Category, Subcategory, News } from '@/types'
import { NewsForm } from '@/features/news'
import { useThemeStore } from '@/store/themeStore'

interface NewNewsClientProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function NewNewsClient({ categories, subcategories }: NewNewsClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: any) => {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        description: null,
        content: formData.content || '',
        image_url: formData.image_url || null,
        youtube_link: formData.youtube_link || null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        created_by: null,
        is_published: formData.is_published || false,
        is_pinned: formData.is_pinned || false,
        published_at: formData.is_published ? (formData.published_at || new Date().toISOString()) : null,
        view_count: 0,
      } as Omit<News, 'id' | 'created_at' | 'updated_at'>),
    })
    const json = await res.json()

    if (json.error) {
      alert(json.error)
      return
    }

    router.push('/content/news')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/content/news')
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleCancel}
          className={`p-2 rounded-lg border ${colors.border} ${colors.text} hover:bg-gray-100 transition-all flex items-center justify-center`}
          title="Go Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className={`text-3xl font-bold ${colors.text}`}>Add New News</h1>
      </div>
      <NewsForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
