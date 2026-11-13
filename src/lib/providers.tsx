'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '@/lib/api/client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            gcTime: 300_000,
            refetchOnWindowFocus: true,
            retry: (count, error) => {
              // No retry for auth/permission/validation errors; one retry for network or 5xx.
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
              return count < 1
            },
          },
          mutations: { retry: 0 },
        },
      })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
