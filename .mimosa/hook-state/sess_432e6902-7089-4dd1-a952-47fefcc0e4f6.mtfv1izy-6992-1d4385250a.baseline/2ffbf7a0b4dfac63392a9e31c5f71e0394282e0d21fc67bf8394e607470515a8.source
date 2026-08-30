'use client'

interface SubmitButtonProps {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  disabled?: boolean
}

export function SubmitButton({
  loading = false,
  loadingText = 'Submitting...',
  children,
  disabled = false
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full bg-[#d42b2b] text-white font-medium text-sm py-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#c02626] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d42b2b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7l-7 7" />
          </svg>
        </>
      )}
    </button>
  )
}
