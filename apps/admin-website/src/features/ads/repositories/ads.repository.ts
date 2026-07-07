import { eq, asc, and, count } from 'drizzle-orm'
import { db } from '@/db'
import { ads } from '@/db/schema'
import { Ad, AdPosition } from '../types'

export const adsRepository = {
  async findAll(): Promise<Ad[]> {
    const result = await db.select().from(ads).orderBy(asc(ads.position), asc(ads.display_order))
    return result as unknown as Ad[]
  },

  async findById(id: string): Promise<Ad | null> {
    const [result] = await db.select().from(ads).where(eq(ads.id, id))
    return result as unknown as Ad | null
  },

  async findActiveByPosition(position: AdPosition): Promise<Ad[]> {
    const result = await db
      .select()
      .from(ads)
      .where(and(eq(ads.position, position), eq(ads.is_active, true)))
      .orderBy(asc(ads.display_order))
    return result as unknown as Ad[]
  },

  async create(data: {
    title: string
    image_url: string
    link_url?: string | null
    position: AdPosition
    display_order: number
    is_active?: boolean
  }): Promise<Ad> {
    const [result] = await db
      .insert(ads)
      .values({
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url || null,
        position: data.position,
        display_order: data.display_order,
        is_active: data.is_active ?? true,
      })
      .returning()
    return result as unknown as Ad
  },

  async update(id: string, updates: Partial<Ad>): Promise<Ad | null> {
    const updateData: Record<string, unknown> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url
    if (updates.link_url !== undefined) updateData.link_url = updates.link_url
    if (updates.position !== undefined) updateData.position = updates.position
    if (updates.display_order !== undefined) updateData.display_order = updates.display_order
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active

    const [result] = await db.update(ads).set(updateData).where(eq(ads.id, id)).returning()
    return result as unknown as Ad | null
  },

  async delete(id: string): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id))
  },

  async toggleActive(id: string): Promise<Ad | null> {
    const [current] = await db.select().from(ads).where(eq(ads.id, id))
    if (!current) return null

    const [result] = await db
      .update(ads)
      .set({ is_active: !current.is_active })
      .where(eq(ads.id, id))
      .returning()
    return result as unknown as Ad | null
  },

  async countByPosition(position: AdPosition): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(ads)
      .where(and(eq(ads.position, position), eq(ads.is_active, true)))
    return result?.value || 0
  },
}
