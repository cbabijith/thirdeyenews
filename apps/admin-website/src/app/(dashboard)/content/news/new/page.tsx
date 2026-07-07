import { categoriesService, subcategoriesService, Category, Subcategory } from '@/features/category'
import { NewNewsClient } from './NewNewsClient'

export const revalidate = 0

export default async function NewNewsPage() {
  const [categoriesResult, subcategoriesResult] = await Promise.all([
    categoriesService.getAllCategories(),
    subcategoriesService.getAllSubcategories(),
  ])

  return (
    <NewNewsClient
      categories={(categoriesResult.data || []) as Category[]}
      subcategories={(subcategoriesResult.data || []) as Subcategory[]}
    />
  )
}
