import { ReactNode } from 'react'
import { LOGIN_TEXT } from './constants'

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — red branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[#d42b2b] px-16 py-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center flex-shrink-0 p-1.5">
            <img src="/logo.svg" alt="ThirdEye News" className="w-full h-full object-contain" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {LOGIN_TEXT.pageTitle}
          </span>
        </div>

        {/* Headline */}
        <div>
          <p className="text-white text-4xl font-bold leading-snug mb-6" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {LOGIN_TEXT.brandHeadline}
          </p>
          <p className="text-white/75 text-sm leading-relaxed">
            {LOGIN_TEXT.brandSubtext}
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 opacity-60">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12l2 2l4-4" />
          </svg>
          <span className="text-white text-xs">{LOGIN_TEXT.securityBadge}</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-20 py-14">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded bg-[#d42b2b] flex items-center justify-center flex-shrink-0 p-1.5">
              <img src="/logo.svg" alt="ThirdEye News" className="w-full h-full object-contain" />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
              {LOGIN_TEXT.pageTitle}
            </span>
          </div>

          {children}

          <p className="text-center text-xs text-slate-400 mt-10">
            {LOGIN_TEXT.footerText}
          </p>
        </div>
      </div>
    </div>
  )
}
