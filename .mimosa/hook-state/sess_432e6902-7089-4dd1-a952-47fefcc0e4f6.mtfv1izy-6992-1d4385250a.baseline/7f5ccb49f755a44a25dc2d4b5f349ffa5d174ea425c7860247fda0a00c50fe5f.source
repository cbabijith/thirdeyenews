'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { createBrowserSupabaseClient } from './browserClient'
import { authService } from './service'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User | null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await authService.signOut()
  }

  return {
    user,
    loading,
    signOut,
  }
}
