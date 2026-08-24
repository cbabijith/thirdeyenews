'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { createClient } from '@/lib/client'
import { Profile, UserRole } from '@/types'

interface AuthState {
  profile: Profile | null
  loading: boolean
  hasFetched: boolean
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setHasFetched: (hasFetched: boolean) => void
}

const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: true,
  hasFetched: false,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setHasFetched: (hasFetched) => set({ hasFetched }),
}))

export function usePermissions() {
  const { profile, loading, hasFetched, setProfile, setLoading, setHasFetched } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    if (hasFetched) return

    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) throw error
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
        setHasFetched(true)
      }
    }

    fetchProfile()
  }, [supabase, hasFetched, setProfile, setLoading, setHasFetched])

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!profile) return false
    if (Array.isArray(roles)) {
      return roles.includes(profile.role)
    }
    return profile.role === roles
  }

  const isSuperAdmin = () => hasRole('superadmin')
  const isAdmin = () => hasRole('admin')
  const isStaff = () => hasRole('staff')
  const isUser = () => hasRole('user')
  const canManageUsers = () => isSuperAdmin()
  const canDeleteContent = () => isSuperAdmin()
  const canCreateContent = () => hasRole(['superadmin', 'admin', 'staff'])
  const canEditContent = () => hasRole(['superadmin', 'admin', 'staff'])

  return {
    profile,
    loading,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isStaff,
    isUser,
    canManageUsers,
    canDeleteContent,
    canCreateContent,
    canEditContent,
  }
}
