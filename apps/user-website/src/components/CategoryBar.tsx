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
    <nav className="bg-white border-b border-gray-250 sticky top-16 z-30">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-2 py-1.5">
        {/* Horizontal Category Items Scroll Container */}
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1 px-2 scroll-smooth">
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-4 py-1.5 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            ഹോം
          </button>
          {categories.length > 0 ? (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`px-4 py-1.5 rounded-lg text-[14px] font-bold transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))
          ) : null}
        </div>

        {/* Plus Button Icon at the far right */}
        <button 
          aria-label="Add Category"
          className="flex items-center justify-center p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      </div>
    </nav>
  )
}
