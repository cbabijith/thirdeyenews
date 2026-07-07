'use client'

import { LoginLayout } from './LoginLayout'
import { LoginForm } from './LoginForm'
import { useAuthActions } from './useAuthActions'

export function LoginPage() {
  const { loading, error, signIn } = useAuthActions()

  return (
    <LoginLayout>
      <LoginForm onSubmit={signIn} loading={loading} error={error} />
    </LoginLayout>
  )
}
