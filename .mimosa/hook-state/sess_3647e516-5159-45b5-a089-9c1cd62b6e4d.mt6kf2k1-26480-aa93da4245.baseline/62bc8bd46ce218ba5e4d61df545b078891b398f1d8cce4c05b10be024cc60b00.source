'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from './service'

export function useAuthActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        const { error } = await authService.signIn(email, password)
        if (error) throw error
        router.push('/')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  return { loading, error, signIn }
}
