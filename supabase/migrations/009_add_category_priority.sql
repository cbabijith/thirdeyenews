-- Add priority column to categories table
ALTER TABLE categories ADD COLUMN priority INTEGER DEFAULT 0;

-- Update existing categories with priority based on creation order
UPDATE categories SET priority = (SELECT ROW_NUMBER() OVER (ORDER BY created_at) - 1);

-- Create index on priority for better performance
CREATE INDEX idx_categories_priority ON categories(priority);
