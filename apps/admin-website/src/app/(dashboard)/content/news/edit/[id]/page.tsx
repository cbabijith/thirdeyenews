import { newsService } from '@/features/news/services/news.service'
import { categoriesService, subcategoriesService, Category, Subcategory } from '@/features/category'
import { notFound } from 'next/navigation'
import { EditNewsClient } from './EditNewsClient'
import { News } from '@/types'

export const revalidate = 0

interface EditNewsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params

  const [newsResult, categoriesResult, subcategoriesResult] = await Promise.all([
    newsService.getNewsById(id),
    categoriesService.getAllCategories(),
    subcategoriesService.getAllSubcategories(),
  ])

  if (!newsResult.data) {
    return notFound()
  }

  return (
    <EditNewsClient
      newsItem={newsResult.data as News}
      categories={(categoriesResult.data || []) as Category[]}
      subcategories={(subcategoriesResult.data || []) as Subcategory[]}
    />
  )
}
