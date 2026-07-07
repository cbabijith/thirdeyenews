-- Add composite indexes for better query performance
-- These indexes optimize common query patterns for news listing

-- Composite index for published + pinned + date queries (home page, category pages)
CREATE INDEX IF NOT EXISTS idx_news_published_pinned_date ON news(is_published, is_pinned, published_at DESC);

-- Composite index for published + view_count queries (trending/most-viewed)
CREATE INDEX IF NOT EXISTS idx_news_published_view_count ON news(is_published, view_count DESC);
