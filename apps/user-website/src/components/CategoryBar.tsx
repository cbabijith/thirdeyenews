'use client'

import Link from 'next/link'
import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryBarProps {
  categories: Category[]
  selectedCategory: string | null
}

export function CategoryBar({ categories, selectedCategory }: CategoryBarProps) {
  const { colors } = useThemeStore()

  return (
    <nav className="bg-background/90 backdrop-blur-md border-b border-border/40 sticky top-20 z-30">
      <div className="max-w-[1240px] mx-auto flex items-center px-4 md:px-6 h-12">
        {/* Horizontal Category Items Scroll Container */}
        <div className="flex-1 flex items-center gap-7 overflow-x-auto no-scrollbar scroll-smooth">
          <Link href="/" prefetch={false}
            className={`h-12 text-[11.5px] font-bold uppercase tracking-[0.18em] whitespace-nowrap transition-all duration-300 relative flex items-center ${
              selectedCategory === null
                ? 'text-primary'
                : 'text-on-surface/65 hover:text-on-surface'
            }`}
          >
            <span>ഹോം</span>
            {selectedCategory === null && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
            )}
          </Link>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${encodeURIComponent(category.id)}`}
                prefetch={false}
                className={`h-12 text-[11.5px] font-bold uppercase tracking-[0.18em] whitespace-nowrap transition-all duration-300 relative flex items-center ${
                  selectedCategory === category.id
                    ? 'text-primary'
                    : 'text-on-surface/65 hover:text-on-surface'
                }`}
              >
                <span>{category.name}</span>
                {selectedCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            ))
          ) : null}
        </div>
      </div>
    </nav>
  )
}
