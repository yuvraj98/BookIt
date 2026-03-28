'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#0a0a0a] text-white">
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} className="text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
            <p className="text-[#a0a0a0] mb-8 leading-relaxed">
              An unexpected error occurred. Our team has been notified. Please try again.
            </p>

            {error.digest && (
              <p className="text-xs text-[#606060] font-mono bg-[#1a1a1a] rounded-lg px-3 py-2 mb-6 border border-[#2a2a2a]">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff3d25] text-white font-medium hover:bg-[#e03520] transition-colors"
              >
                <RefreshCcw size={16} />
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:border-[#3a3a3a] transition-colors"
              >
                <Home size={16} />
                Go Home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
