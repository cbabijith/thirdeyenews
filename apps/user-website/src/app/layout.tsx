import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thirdeyenewslive.com'),
  title: 'ThirdEye News - User Website',
  description: 'ThirdEye News User Portal',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    siteName: 'ThirdEye News',
    locale: 'ml_IN',
    type: 'website',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#cc0000',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pub-97fd80f978a242f6ad98240e478fe547.r2.dev" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.variable} font-inter`}>{children}</body>
    </html>
  )
}
