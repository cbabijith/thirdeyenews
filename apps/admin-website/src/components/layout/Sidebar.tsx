'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '@/store/navigationStore'
import { LayoutDashboard, Newspaper, Folder, Megaphone, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, setCurrentPath } = useNavigationStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/content/news', label: 'News', icon: Newspaper },
    { href: '/content/categories', label: 'Categories', icon: Folder },
    { href: '/content/ads', label: 'Ads', icon: Megaphone },
  ]

  const handleNavClick = (href: string) => {
    setCurrentPath(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header / Logo */}
        <div className={`px-3 py-2.5 border-b border-gray-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center">
              <img src="/logo.svg" alt="ThirdEye News" className="h-8 w-auto object-contain" />
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-all active:scale-95 cursor-pointer"
              title="Expand sidebar"
            >
              <img src="/logo.svg" alt="ThirdEye News" className="h-8 w-8 object-contain" />
            </button>
          )}
          
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`flex items-center rounded-lg transition-all duration-200 ${
                      sidebarOpen ? 'px-3 py-2 gap-3' : 'p-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom: Logout + Collapse Toggle */}
        <div className="border-t border-gray-100">
          {sidebarOpen && (
            <div className="px-2 py-2">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center w-full px-3 py-2 gap-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut size={18} className="text-gray-400" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <div className="p-2 flex flex-col items-center gap-2">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          {sidebarOpen && (
            <div className="px-2 pb-2">
              <button
                onClick={toggleSidebar}
                className="flex items-center w-full px-3 py-2 gap-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <ChevronLeft size={18} className="text-gray-400" />
                <span className="font-medium text-sm">Collapse</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-40 md:hidden pb-safe shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 text-xs transition-colors ${
                isActive ? 'text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Logout?</h3>
                <p className="text-sm text-gray-500">You'll need to sign in again to access the admin panel.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
