import { eq, asc, count } from 'drizzle-orm'
import { db } from '@/db'
import { categories, news, subcategories } from '@/db/schema'
import { Category } from '../types'

export const categoriesRepository = {
  async findAll(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(asc(categories.priority))
    return result as unknown as Category[]
  },

  async findById(id: string): Promise<Category | null> {
    const [result] = await db.select().from(categories).where(eq(categories.id, id))
    return result as unknown as Category | null
  },

  async create(data: { name: string; slug: string; description?: string | null }): Promise<Category> {
    const [result] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        priority: 0,
      })
      .returning()
    return result as unknown as Category
  },

  async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.priority !== undefined) updateData.priority = updates.priority

    const [result] = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning()
    return result as unknown as Category | null
  },

  async updatePriorities(updates: { id: string; priority: number }[]): Promise<void> {
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx.update(categories).set({ priority: update.priority }).where(eq(categories.id, update.id))
      }
    })
  },

  async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id))
  },

  async countNewsByCategory(id: string): Promise<number> {
    const [result] = await db.select({ value: count() }).from(news).where(eq(news.category_id, id))
    return result?.value || 0
  },

  async countSubcategoriesByCategory(id: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(subcategories)
      .where(eq(subcategories.category_id, id))
    return result?.value || 0
  },
}
