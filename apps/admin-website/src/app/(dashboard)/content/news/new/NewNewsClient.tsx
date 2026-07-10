'use client'

import { useRouter } from 'next/navigation'
import { Category, Subcategory, News } from '@/types'
import { NewsForm } from '@/features/news'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface NewNewsClientProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function NewNewsClient({ categories, subcategories }: NewNewsClientProps) {
  const router = useRouter()

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
        slug: formData.slug || null,
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
    <div className="px-4 sm:px-6 py-6">
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <Link href="/content/news" className="hover:text-gray-600 transition-colors">News</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">New Article</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Create News Article</h1>
      </div>
      <NewsForm
        categories={categories}
        subcategories={subcategories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
