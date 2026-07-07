'use client'

import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryBarProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoryBar({ categories, selectedCategory, onCategorySelect }: CategoryBarProps) {
  const { colors } = useThemeStore()

  return (
    <nav className="bg-background border-b border-border sticky top-14 z-30">
      <div className="flex items-center gap-1 px-3 py-2">
        {/* Horizontal Category Items Scroll Container */}
        <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-3.5 py-1.5 rounded-sm text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary text-on-primary'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            ഹോം
          </button>
          {categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`px-3.5 py-1.5 rounded-sm text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                {category.name}
              </button>
            ))
          ) : null}
        </div>

        {/* Plus Button Icon at the far right */}
        <button
          aria-label="More Categories"
          className="flex items-center justify-center text-on-surface hover:opacity-70 transition-opacity flex-shrink-0 ml-1"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </nav>
  )
}
