import { eq, asc, count } from 'drizzle-orm'
import { db } from '@/db'
import { subcategories, news } from '@/db/schema'
import { Subcategory } from '../types'

export const subcategoriesRepository = {
  async findAll(): Promise<Subcategory[]> {
    const result = await db.query.subcategories.findMany({
      with: { categories: true },
      orderBy: asc(subcategories.name),
    })
    return result as unknown as Subcategory[]
  },

  async findByCategory(categoryId: string): Promise<Subcategory[]> {
    const result = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.category_id, categoryId))
      .orderBy(asc(subcategories.name))
    return result as unknown as Subcategory[]
  },

  async findById(id: string): Promise<Subcategory | null> {
    const result = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, id),
      with: { categories: true },
    })
    return result as unknown as Subcategory | null
  },

  async create(data: {
    category_id: string
    name: string
    slug: string
    description?: string | null
  }): Promise<Subcategory> {
    const [result] = await db
      .insert(subcategories)
      .values({
        category_id: data.category_id,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      })
      .returning()

    const withCategory = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, result.id),
      with: { categories: true },
    })
    return withCategory as unknown as Subcategory
  },

  async update(
    id: string,
    updates: Partial<Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Subcategory | null> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.category_id !== undefined) updateData.category_id = updates.category_id

    await db.update(subcategories).set(updateData).where(eq(subcategories.id, id))

    const result = await db.query.subcategories.findFirst({
      where: eq(subcategories.id, id),
      with: { categories: true },
    })
    return result as unknown as Subcategory | null
  },

  async delete(id: string): Promise<void> {
    await db.delete(subcategories).where(eq(subcategories.id, id))
  },

  async countNewsBySubcategory(id: string): Promise<number> {
    const [result] = await db.select({ value: count() }).from(news).where(eq(news.subcategory_id, id))
    return result?.value || 0
  },
}
