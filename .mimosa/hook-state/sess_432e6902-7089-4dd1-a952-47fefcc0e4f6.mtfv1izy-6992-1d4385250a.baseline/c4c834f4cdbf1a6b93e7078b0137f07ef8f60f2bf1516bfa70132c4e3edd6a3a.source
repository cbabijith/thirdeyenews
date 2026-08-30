import { newsService } from '@/features/news/services/news.service'
import { NewsClient } from '@/features/news'
import { categoriesService, subcategoriesService, Category, Subcategory } from '@/features/category'

export const revalidate = 60

export default async function NewsPage() {
  const [{ data: newsData, count }, categoriesResult, subcategoriesResult] = await Promise.all([
    newsService.getNewsForListPage(20, 0),
    categoriesService.getAllCategories(),
    subcategoriesService.getAllSubcategories(),
  ])

  return (
    <NewsClient
      initialNews={newsData}
      initialCategories={(categoriesResult.data || []) as Category[]}
      initialSubcategories={(subcategoriesResult.data || []) as Subcategory[]}
      initialCount={count}
    />
  )
}
