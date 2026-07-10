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
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/80 sticky top-14 z-30">
      <div className="max-w-[1240px] mx-auto flex items-center gap-3 px-4 md:px-6 py-2.5">
        {/* Horizontal Category Items Scroll Container */}
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${
              selectedCategory === null
                ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border/20'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">home</span>
            <span>ഹോം</span>
          </button>
          {categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border border-border/20'
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
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-low border border-border/20 text-on-surface hover:bg-surface-container-high transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </nav>
  )
}
