import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { Profile } from '@/types'

export const profilesRepository = {
  async findAll(): Promise<Profile[]> {
    const result = await db.select().from(profiles).orderBy(desc(profiles.created_at))
    return result as unknown as Profile[]
  },

  async findByRole(role: 'admin' | 'staff' | 'user'): Promise<Profile[]> {
    const result = await db.select().from(profiles).where(eq(profiles.role, role))
    return result as unknown as Profile[]
  },

  async findById(id: string): Promise<Profile | null> {
    const [result] = await db.select().from(profiles).where(eq(profiles.id, id))
    return result as unknown as Profile | null
  },
}
