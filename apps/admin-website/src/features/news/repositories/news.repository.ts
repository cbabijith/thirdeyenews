import { eq, desc, asc, and, or, ilike, count } from 'drizzle-orm'
import { db } from '@/db'
import { news } from '@/db/schema'
import { News, NewsSearchParams, NewsSearchResult } from '../types'

export const newsRepository = {
  async findAll(includeCategory = true): Promise<News[]> {
    const result = includeCategory
      ? await db.query.news.findMany({
          with: { categories: true, profiles: true },
          orderBy: desc(news.created_at),
        })
      : await db.query.news.findMany({
          with: { profiles: true },
          orderBy: desc(news.created_at),
        })
    return result as unknown as News[]
  },

  async findById(id: string, includeCategory = true): Promise<News | null> {
    const result = includeCategory
      ? await db.query.news.findFirst({
          where: eq(news.id, id),
          with: { categories: true, profiles: true },
        })
      : await db.query.news.findFirst({
          where: eq(news.id, id),
          with: { profiles: true },
        })
    return result as unknown as News | null
  },

  async findByCategory(categoryId: string): Promise<News[]> {
    const result = await db.query.news.findMany({
      where: eq(news.category_id, categoryId),
      with: { categories: true },
      orderBy: desc(news.created_at),
    })
    return result as unknown as News[]
  },

  async findPublished(): Promise<News[]> {
    const result = await db.query.news.findMany({
      where: eq(news.is_published, true),
      with: { categories: true },
      orderBy: desc(news.published_at),
    })
    return result as unknown as News[]
  },

  async findPublishedWithRelations(limit: number, offset: number): Promise<News[]> {
    const result = await db.query.news.findMany({
      with: { categories: true, profiles: true },
      orderBy: [desc(news.published_at), desc(news.created_at)],
      limit,
      offset,
    })
    return result as unknown as News[]
  },

  async count(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(news)
    return result?.value || 0
  },

  async search(params: NewsSearchParams): Promise<NewsSearchResult> {
    const whereConditions = and(
      params.categoryId ? eq(news.category_id, params.categoryId) : undefined,
      params.searchQuery
        ? or(
            ilike(news.title, `%${params.searchQuery.trim()}%`),
            ilike(news.description, `%${params.searchQuery.trim()}%`),
            ilike(news.content, `%${params.searchQuery.trim()}%`),
          )
        : undefined,
    )

    let orderByClause
    switch (params.sortBy) {
      case 'date-desc':
        orderByClause = [desc(news.published_at), desc(news.created_at)]
        break
      case 'date-asc':
        orderByClause = [asc(news.published_at), asc(news.created_at)]
        break
      case 'title-asc':
        orderByClause = [asc(news.title)]
        break
      case 'title-desc':
        orderByClause = [desc(news.title)]
        break
      case 'category':
        orderByClause = [asc(news.category_id)]
        break
      case 'views-desc':
        orderByClause = [desc(news.view_count)]
        break
      default:
        orderByClause = [desc(news.created_at)]
    }

    const [dataResult, countResult] = await Promise.all([
      db.query.news.findMany({
        where: whereConditions,
        with: { categories: true, profiles: true },
        orderBy: orderByClause,
        limit: params.limit,
        offset: params.offset,
      }),
      db.select({ value: count() }).from(news).where(whereConditions),
    ])

    return {
      data: dataResult as unknown as News[],
      count: countResult[0]?.value || 0,
    }
  },

  async create(data: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
    const [result] = await db
      .insert(news)
      .values({
        title: data.title,
        content: data.content || '',
        description: data.description || null,
        image_url: data.image_url || null,
        youtube_link: data.youtube_link || null,
        category_id: data.category_id || null,
        subcategory_id: data.subcategory_id || null,
        created_by: data.created_by || null,
        is_published: data.is_published || false,
        is_pinned: data.is_pinned || false,
        published_at: data.published_at ? new Date(data.published_at) : null,
        view_count: data.view_count || 0,
      })
      .returning()
    return result as unknown as News
  },

  async update(id: string, updates: Partial<News>): Promise<News | null> {
    const updateData: Record<string, unknown> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url
    if (updates.youtube_link !== undefined) updateData.youtube_link = updates.youtube_link
    if (updates.category_id !== undefined) updateData.category_id = updates.category_id
    if (updates.subcategory_id !== undefined) updateData.subcategory_id = updates.subcategory_id
    if (updates.is_published !== undefined) updateData.is_published = updates.is_published
    if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned
    if (updates.published_at !== undefined)
      updateData.published_at = updates.published_at ? new Date(updates.published_at) : null

    const [result] = await db.update(news).set(updateData).where(eq(news.id, id)).returning()
    return result as unknown as News | null
  },

  async delete(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id))
  },

  async updatePublishStatus(id: string, isPublished: boolean): Promise<News | null> {
    const [result] = await db
      .update(news)
      .set({
        is_published: isPublished,
        published_at: isPublished ? new Date() : null,
      })
      .where(eq(news.id, id))
      .returning()
    return result as unknown as News | null
  },
}
