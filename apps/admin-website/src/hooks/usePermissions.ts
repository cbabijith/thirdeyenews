'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { Profile, UserRole } from '@/types'

export function usePermissions() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
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
      }
    }

    fetchProfile()
  }, [supabase])

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
