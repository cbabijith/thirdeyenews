import { eq, ne, desc, asc, and, or, ilike, count, sql, lt, gt } from 'drizzle-orm'
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
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    const condition = isUUID ? eq(news.id, id) : eq(news.slug, id)
    const result = includeCategory
      ? await db.query.news.findFirst({
          where: condition,
          with: { categories: true, profiles: true },
        })
      : await db.query.news.findFirst({
          where: condition,
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
      where: eq(news.is_published, true),
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: [desc(news.published_at), desc(news.created_at)],
      limit,
      offset,
    })
    return result as unknown as News[]
  },

  async findAllWithRelations(limit: number, offset: number): Promise<News[]> {
    const result = await db.query.news.findMany({
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: [desc(news.created_at)],
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
    const escapeLike = (str: string) => str.replace(/[%_\\]/g, '\\$&')
    const whereConditions = and(
      params.categoryId ? eq(news.category_id, params.categoryId) : undefined,
      params.searchQuery
        ? or(
            ilike(news.title, `%${escapeLike(params.searchQuery.trim())}%`),
            ilike(news.description, `%${escapeLike(params.searchQuery.trim())}%`),
            ilike(news.content, `%${escapeLike(params.searchQuery.trim())}%`),
          )
        : undefined,
    )

    let orderByClause
    switch (params.sortBy) {
      case 'date-desc':
        orderByClause = [desc(news.created_at)]
        break
      case 'date-asc':
        orderByClause = [asc(news.created_at)]
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
        slug: data.slug || null,
        ad_image_url: data.ad_image_url || null,
        ad_link_url: data.ad_link_url || null,
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
    if (updates.category_id !== undefined) updateData.category_id = updates.category_id || null
    if (updates.subcategory_id !== undefined) updateData.subcategory_id = updates.subcategory_id || null
    if (updates.is_published !== undefined) updateData.is_published = updates.is_published
    if (updates.is_pinned !== undefined) updateData.is_pinned = updates.is_pinned
    if (updates.published_at !== undefined)
      updateData.published_at = updates.published_at ? new Date(updates.published_at) : null
    if (updates.slug !== undefined) updateData.slug = updates.slug || null
    if (updates.ad_image_url !== undefined) updateData.ad_image_url = updates.ad_image_url || null
    if (updates.ad_link_url !== undefined) updateData.ad_link_url = updates.ad_link_url || null

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

  async findTopViewed(limit: number = 5): Promise<News[]> {
    const result = await db.query.news.findMany({
      where: eq(news.is_published, true),
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: [desc(news.view_count)],
      limit,
    })
    return result as unknown as News[]
  },

  async getTotalViews(): Promise<number> {
    const [result] = await db
      .select({ total: sql<number>`coalesce(sum(${news.view_count}), 0)` })
      .from(news)
    return result?.total || 0
  },

  async countPublished(): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(news)
      .where(eq(news.is_published, true))
    return result?.value || 0
  },

  async countDrafts(): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(news)
      .where(eq(news.is_published, false))
    return result?.value || 0
  },

  async findPinnedPublished(categoryId?: string, limit: number = 5): Promise<News[]> {
    const whereConditions = categoryId
      ? and(eq(news.is_published, true), eq(news.is_pinned, true), eq(news.category_id, categoryId))
      : and(eq(news.is_published, true), eq(news.is_pinned, true))
    const result = await db.query.news.findMany({
      where: whereConditions,
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: desc(news.published_at),
      limit,
    })
    return result as unknown as News[]
  },

  async findRecentPublished(categoryId?: string, limit: number = 10, offset: number = 0): Promise<News[]> {
    const whereConditions = categoryId
      ? and(eq(news.is_published, true), eq(news.is_pinned, false), eq(news.category_id, categoryId))
      : and(eq(news.is_published, true), eq(news.is_pinned, false))
    const result = await db.query.news.findMany({
      where: whereConditions,
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: [desc(news.published_at), desc(news.created_at)],
      limit,
      offset,
    })
    return result as unknown as News[]
  },

  async findRelatedPublished(newsId: string, categoryId?: string | null, limit: number = 4): Promise<News[]> {
    const whereConditions = categoryId
      ? and(eq(news.is_published, true), sql`${news.id} != ${newsId}`, eq(news.category_id, categoryId))
      : and(eq(news.is_published, true), sql`${news.id} != ${newsId}`)
    const result = await db.query.news.findMany({
      where: whereConditions,
      columns: {
        content: false,
      },
      with: { categories: true },
      orderBy: desc(news.published_at),
      limit,
    })
    return result as unknown as News[]
  },

  async searchPublished(query: string, limit: number = 10, offset: number = 0): Promise<News[]> {
    const escapeLike = (str: string) => str.replace(/[%_\\]/g, '\\$&')
    const whereConditions = and(
      eq(news.is_published, true),
      or(
        ilike(news.title, `%${escapeLike(query.trim())}%`),
        ilike(news.description, `%${escapeLike(query.trim())}%`),
        ilike(news.content, `%${escapeLike(query.trim())}%`),
      )
    )
    const result = await db.query.news.findMany({
      where: whereConditions,
      columns: {
        content: false,
      },
      with: { categories: true, profiles: true },
      orderBy: desc(news.published_at),
      limit,
      offset,
    })
    return result as unknown as News[]
  },

  async isSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = excludeId 
      ? and(eq(news.slug, slug), ne(news.id, excludeId))
      : eq(news.slug, slug)
    
    const [result] = await db
      .select({ id: news.id })
      .from(news)
      .where(conditions)
      .limit(1)
    
    return !!result
  },

  async findAdjacentPublished(current: News): Promise<{ prev: News | null; next: News | null }> {
    const currentPublishedAt = current.published_at ? new Date(current.published_at) : null
    const currentCreatedAt = current.created_at ? new Date(current.created_at) : new Date()

    let prevCondition
    let nextCondition

    if (currentPublishedAt) {
      prevCondition = and(
        eq(news.is_published, true),
        or(
          lt(news.published_at, currentPublishedAt),
          and(
            eq(news.published_at, currentPublishedAt),
            lt(news.created_at, currentCreatedAt)
          )
        )
      )

      nextCondition = and(
        eq(news.is_published, true),
        or(
          gt(news.published_at, currentPublishedAt),
          and(
            eq(news.published_at, currentPublishedAt),
            gt(news.created_at, currentCreatedAt)
          )
        )
      )
    } else {
      prevCondition = and(
        eq(news.is_published, true),
        lt(news.created_at, currentCreatedAt)
      )

      nextCondition = and(
        eq(news.is_published, true),
        gt(news.created_at, currentCreatedAt)
      )
    }

    const prevResult = await db.query.news.findFirst({
      where: prevCondition,
      columns: {
        content: false,
      },
      orderBy: [desc(news.published_at), desc(news.created_at)],
    })

    const nextResult = await db.query.news.findFirst({
      where: nextCondition,
      columns: {
        content: false,
      },
      orderBy: [asc(news.published_at), asc(news.created_at)],
    })

    return {
      prev: prevResult as unknown as News | null,
      next: nextResult as unknown as News | null,
    }
  },

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(news)
      .set({ view_count: sql`${news.view_count} + 20` })
      .where(eq(news.id, id))
  },
}
