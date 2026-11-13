'use client'

import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError } from '@/lib/api/client'
import { merchantsCopy } from '@/lib/copy'
import { useMerchants } from '@/hooks/useMerchants'
import { MerchantTable } from './MerchantTable'

export function MerchantsView() {
  const { data, isLoading, isError, error, refetch } = useMerchants()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...(data ?? [])].sort((a, b) => b.pending_count - a.pending_count)
    if (!q) return list
    return list.filter((m) => m.name.toLowerCase().includes(q) || m.merchant_id.toLowerCase().includes(q))
  }, [data, query])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading merchants">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    const apiError = error instanceof ApiError ? error : null
    const message =
      apiError?.code === 'not_configured'
        ? merchantsCopy.notConfigured
        : apiError?.status === 403
          ? merchantsCopy.forbidden
          : (apiError?.message ?? merchantsCopy.loadFailed)
    return <ErrorState message={message} requestId={apiError?.requestId} onRetry={() => refetch()} />
  }

  if (!data || data.length === 0) {
    return <EmptyState title={merchantsCopy.empty} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <Input
          label="Search merchants"
          type="search"
          placeholder="Name or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title={merchantsCopy.noMatches(query)} />
      ) : (
        <MerchantTable merchants={filtered} />
      )}
    </div>
  )
}
