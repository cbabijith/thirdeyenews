-- Performance Indexes (100K+ Articles Scaling)
CREATE INDEX IF NOT EXISTS idx_news_published_at_partial ON news(published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
