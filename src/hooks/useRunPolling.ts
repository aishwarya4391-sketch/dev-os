'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '@/lib/api/keys'
import { getRun } from '@/lib/api/runs'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import type { RunStatus } from '@/types/api'

const ACTIVE: RunStatus[] = ['queued', 'running']

export function isRunActive(status: RunStatus | undefined) {
  return !!status && ACTIVE.includes(status)
}

export function useRunPolling(runId: string, merchantId: string) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.run(runId),
    queryFn: () => getRun(runId),
    // Poll only while the run is active. Background tabs are paused by react-query by default.
    refetchInterval: (q) => (isRunActive(q.state.data?.status) ? POLL_INTERVAL_MS : false),
    staleTime: 0,
  })

  const status = query.data?.status
  useEffect(() => {
    if (status && !isRunActive(status)) {
      queryClient.invalidateQueries({ queryKey: queryKeys.merchants })
      queryClient.invalidateQueries({ queryKey: queryKeys.review(merchantId) })
    }
  }, [status, merchantId, queryClient])

  return query
}
