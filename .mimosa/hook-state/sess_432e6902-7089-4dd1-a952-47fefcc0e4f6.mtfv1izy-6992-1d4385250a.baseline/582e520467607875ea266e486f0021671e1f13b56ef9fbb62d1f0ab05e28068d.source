'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BottomNavAd } from './BottomNavAd'

export function BottomNavBar() {
  const pathname = usePathname()

  const tabs = [
    { label: 'ഹോം', icon: 'home', href: '/' },
    { label: 'കാറ്റഗറി', icon: 'grid_view', href: '/?category=all' },
    { label: 'വീഡിയോ', icon: 'play_circle', href: '/#video' },
    { label: 'അറിയിപ്പുകൾ', icon: 'notifications', href: '/#notifications' },
    { label: 'മെനു', icon: 'menu', href: '/#menu' },
  ]

  return (
    <>
      {/* Bottom Nav Ad Banner */}
      <div className="fixed bottom-[52px] left-0 right-0 h-12 z-40 px-2 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <BottomNavAd />
      </div>

      {/* 5-Tab Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around px-2 py-2 md:hidden z-40 safe-bottom">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' && pathname === '/'
          return (
            <Link
              key={tab.label}
              href={tab.href}
              prefetch={false}
              className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center px-2 py-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
