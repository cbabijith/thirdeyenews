'use client'

import { useRouter } from 'next/navigation'
import { Category, Subcategory, News } from '@/types'
import { NewsForm } from '@/features/news'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface EditNewsClientProps {
  newsItem: News
  categories: Category[]
  subcategories: Subcategory[]
}

export function EditNewsClient({ newsItem, categories, subcategories }: EditNewsClientProps) {
  const router = useRouter()

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
    <div className="px-4 sm:px-6 py-6">
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <Link href="/content/news" className="hover:text-gray-600 transition-colors">News</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Edit Article</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Edit News Article</h1>
      </div>
      <NewsForm
        categories={categories}
        subcategories={subcategories}
        initialData={newsItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
