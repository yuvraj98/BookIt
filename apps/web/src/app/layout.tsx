import type { Metadata, Viewport } from 'next'
import { Inter, Syne } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BookIt — Discover & Book Local Events in Pune',
    template: '%s | BookIt',
  },
  description:
    'BookIt is India\'s local events ticketing platform. Discover comedy shows, music nights, workshops, sports & more in your city. Book tickets in seconds via UPI.',
  keywords: ['events in Pune', 'comedy shows Pune', 'book tickets online', 'local events India'],
  authors: [{ name: 'BookIt' }],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bookit.in',
    siteName: 'BookIt',
    title: 'BookIt — Discover & Book Local Events',
    description: 'India\'s local events ticketing platform. 18 categories. Hundreds of events.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BookIt Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookIt — Discover & Book Local Events',
    description: 'India\'s local events ticketing platform.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff3d25',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#f5f5f5',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#0f0f0f' } },
              error: { iconTheme: { primary: '#ff3d25', secondary: '#0f0f0f' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
