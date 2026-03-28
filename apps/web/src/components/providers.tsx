'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from '@/components/shared/ThemeToggle'
import { useEventReminders } from '@/hooks/useEventReminders'
import { PwaProvider } from '@/components/shared/PwaProvider'

function GlobalReminders() {
  useEventReminders()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <ThemeProvider>
      <PwaProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalReminders />
          {children}
        </QueryClientProvider>
      </PwaProvider>
    </ThemeProvider>
  )
}
