'use client'

import { useRouter } from 'next/navigation'
import { Category, Subcategory, News } from '@/types'
import { NewsForm } from '@/features/news'
import { useThemeStore } from '@/store/themeStore'

interface EditNewsClientProps {
  newsItem: News
  categories: Category[]
  subcategories: Subcategory[]
}

export function EditNewsClient({ newsItem, categories, subcategories }: EditNewsClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: any) => {
    const updates: Partial<News> = {}
    if (formData.title !== undefined) updates.title = formData.title
    if (formData.content !== undefined) updates.content = formData.content
    if (formData.image_url !== undefined) updates.image_url = formData.image_url
    if (formData.youtube_link !== undefined) updates.youtube_link = formData.youtube_link
    if (formData.category_id !== undefined) updates.category_id = formData.category_id || null
    if (formData.subcategory_id !== undefined) updates.subcategory_id = formData.subcategory_id || null
    if (formData.is_published !== undefined) updates.is_published = formData.is_published
    if (formData.is_pinned !== undefined) updates.is_pinned = formData.is_pinned
    if (formData.published_at !== undefined) updates.published_at = formData.published_at || null

    const res = await fetch(`/api/news/${newsItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
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
        <h1 className={`text-3xl font-bold ${colors.text}`}>Edit News</h1>
      </div>
      <NewsForm
        categories={categories}
        initialData={newsItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
