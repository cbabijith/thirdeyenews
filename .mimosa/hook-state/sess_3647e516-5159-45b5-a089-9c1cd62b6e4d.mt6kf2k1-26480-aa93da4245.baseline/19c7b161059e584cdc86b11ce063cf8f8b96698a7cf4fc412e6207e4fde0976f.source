import type { Metadata } from 'next'
import { Inter, Geist, PT_Serif } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ThirdEye News - Admin Website',
  description: 'ThirdEye News Admin Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, ptSerif.variable)}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
