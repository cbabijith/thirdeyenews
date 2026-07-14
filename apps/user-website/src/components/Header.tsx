'use client'

import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, Category } from '@/lib/api'

type ThemeMode = 'light' | 'dark'

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

interface NewsItem {
  id: string
  title: string
}

interface HeaderProps {
  pinnedNews?: NewsItem[]
  categories?: Category[]
}

export function Header({ pinnedNews = [], categories: propCategories = [] }: HeaderProps) {
  const { colors } = useThemeStore()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(propCategories)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [darkMode, setDarkMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') as ThemeMode | null : null
    if (stored) {
      setDarkMode(stored)
      applyTheme(stored)
    }
  }, [])

  const toggleDarkMode = () => {
    const next = darkMode === 'light' ? 'dark' : 'light'
    setDarkMode(next)
    applyTheme(next)
    if (typeof window !== 'undefined') localStorage.setItem('theme', next)
  }

  useEffect(() => {
    if (propCategories.length > 0) {
      setCategories(propCategories)
      return
    }
    async function fetchCategories() {
      try {
        const data = await api.getCategories()
        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories for header:', err)
      }
    }
    fetchCategories()
  }, [propCategories])

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 h-20 w-full">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Menu"
          className="text-on-surface hover:opacity-80 transition-all cursor-pointer active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Logo */}
        <Link href="/" prefetch={false} className="hover:opacity-90 transition-opacity flex items-center">
          <img src="/thirdeye.svg" alt="ThirdEye News" className="h-[60px] md:h-[66px] w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Capsule */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-5 bg-secondary rounded-xl flex items-center px-1 cursor-pointer relative transition-colors duration-200"
            aria-label="Toggle theme"
          >
            <div className={`w-4 h-4 bg-white rounded-full flex items-center justify-center transition-transform duration-200 ${darkMode === 'dark' ? 'ml-auto' : 'mr-auto'}`}>
              <span className="material-symbols-outlined text-[10px] text-secondary">{darkMode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/search')}
            aria-label="Search"
            className="text-on-surface hover:opacity-80 transition-all cursor-pointer active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>
      </header>
      
      {/* Mobile Categories Sidebar Drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex transition-opacity duration-300"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">folder</span>
                <span className="font-bold text-on-surface text-base">Categories</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Sidebar List Content */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      router.push('/')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">home</span>
                    All News
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        router.push(`/?category=${cat.id}`)
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border bg-surface-container text-center">
              <p className="text-[10px] text-on-surface-variant">© 2026 ThirdEye News</p>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
