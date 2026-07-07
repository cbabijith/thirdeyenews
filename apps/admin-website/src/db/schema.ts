import { pgTable, uuid, text, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff', 'user'])

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  full_name: text('full_name'),
  email: text('email'),
  role: userRoleEnum('role').default('user'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const subcategories = pgTable('subcategories', {
  id: uuid('id').defaultRandom().primaryKey(),
  category_id: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const news = pgTable('news', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  description: text('description'),
  image_url: text('image_url'),
  youtube_link: text('youtube_link'),
  category_id: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  subcategory_id: uuid('subcategory_id').references(() => subcategories.id, { onDelete: 'set null' }),
  created_by: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  is_published: boolean('is_published').default(false).notNull(),
  is_pinned: boolean('is_pinned').default(false).notNull(),
  published_at: timestamp('published_at', { withTimezone: true }),
  view_count: integer('view_count').default(0).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  news_id: uuid('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const likes = pgTable('likes', {
  id: uuid('id').defaultRandom().primaryKey(),
  news_id: uuid('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ads = pgTable('ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  image_url: text('image_url').notNull(),
  link_url: text('link_url'),
  position: text('position').notNull().default('main_banner'),
  is_active: boolean('is_active').default(true).notNull(),
  display_order: integer('display_order').default(0).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const newsRelations = relations(news, ({ one }) => ({
  categories: one(categories, { fields: [news.category_id], references: [categories.id] }),
  subcategories: one(subcategories, { fields: [news.subcategory_id], references: [subcategories.id] }),
  profiles: one(profiles, { fields: [news.created_by], references: [profiles.id] }),
}))

export const subcategoryRelations = relations(subcategories, ({ one }) => ({
  categories: one(categories, { fields: [subcategories.category_id], references: [categories.id] }),
}))

export const categoryRelations = relations(categories, ({ many }) => ({
  news: many(news),
  subcategories: many(subcategories),
}))
