'use client'

import { useState } from 'react'
import { EmailInput } from './EmailInput'
import { PasswordInput } from './PasswordInput'
import { SubmitButton } from './SubmitButton'
import { LOGIN_TEXT } from './constants'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function LoginForm({ onSubmit, loading = false, error = null }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Admin label */}
      <p className="text-slate-500 text-sm font-medium mb-1 tracking-wide">
        {LOGIN_TEXT.adminLabel}
      </p>
      <h1 className="text-slate-900 text-3xl font-bold mb-10" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
        Sign in to your account
      </h1>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {LOGIN_TEXT.emailLabel}
        </label>
        <EmailInput
          value={email}
          onChange={setEmail}
          placeholder={LOGIN_TEXT.emailPlaceholder}
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          {LOGIN_TEXT.passwordLabel}
        </label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder={LOGIN_TEXT.passwordPlaceholder}
        />
      </div>

      <SubmitButton
        loading={loading}
        loadingText={LOGIN_TEXT.signingInText}
      >
        {LOGIN_TEXT.signInButton}
      </SubmitButton>
    </form>
  )
}
