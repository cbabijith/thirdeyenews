'use client'

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function EmailInput({
  value,
  onChange,
  placeholder = 'you@example.com',
  required = true
}: EmailInputProps) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 rounded-md px-4 py-3 transition-colors duration-200 focus-within:border-slate-400">
      <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
        <rect width="20" height="16" x="2" y="4" rx="2" />
      </svg>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required={required}
        className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none border-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
