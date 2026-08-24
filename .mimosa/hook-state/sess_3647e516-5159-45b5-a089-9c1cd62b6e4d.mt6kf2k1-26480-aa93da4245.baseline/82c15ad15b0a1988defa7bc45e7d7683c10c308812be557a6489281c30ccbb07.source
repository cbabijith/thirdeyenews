'use client'

interface SignUpButtonProps {
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

export function SignUpButton({
  onClick,
  children,
  disabled = false
}: SignUpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-button hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button disabled:opacity-50 disabled:cursor-not-allowed mt-4"
    >
      {children}
    </button>
  )
}
