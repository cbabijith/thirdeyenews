'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useNavigationStore } from '@/store/navigationStore'
import { usePermissions } from '@/hooks/usePermissions'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen } = useNavigationStore()
  const { profile, loading, hasRole } = usePermissions()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      const isSuperAdminOnlyRoute = pathname === '/' || pathname.startsWith('/content/categories') || pathname.startsWith('/content/ads')
      if (isSuperAdminOnlyRoute && !hasRole('superadmin')) {
        router.push('/content/news')
      }
    }
  }, [profile, loading, pathname, router, hasRole])

  const isSuperAdminOnlyRoute = pathname === '/' || pathname.startsWith('/content/categories') || pathname.startsWith('/content/ads')
  const shouldBlock = isSuperAdminOnlyRoute && !loading && profile && !hasRole('superadmin')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ThirdEye News" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">ThirdEye News</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </header>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        } ml-0 pb-20 md:pb-0`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {shouldBlock || loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
