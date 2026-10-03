'use client'

import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: 'current-password' | 'new-password'
  minLength?: number
  maxLength?: number
  describedBy?: string
}

export function PasswordInput({
  value, onChange, id = 'password', placeholder = 'Enter your password', required = true,
  disabled = false, autoComplete = 'current-password', minLength, maxLength, describedBy,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 pl-3 focus-within:ring-2 focus-within:ring-slate-400">
      <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input
        id={id} name={id} type={showPassword ? 'text' : 'password'} autoComplete={autoComplete}
        required={required} disabled={disabled} minLength={minLength} maxLength={maxLength}
        aria-describedby={describedBy} placeholder={placeholder} value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 border-none bg-transparent py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={disabled}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} aria-controls={id}>
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
