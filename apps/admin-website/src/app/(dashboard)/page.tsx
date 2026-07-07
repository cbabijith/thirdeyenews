'use client'

import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuth } from '@/features/auth/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {user ? `Welcome back, ${user.email?.split('@')[0]}` : 'Welcome back'}
          </h1>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="px-4 py-2 bg-button text-white rounded-lg hover:opacity-90"
          >
            Logout
          </button>
        </form>
      </div>
      <Dashboard />
    </div>
  )
}
