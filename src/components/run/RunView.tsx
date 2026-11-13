'use client'

import Link from 'next/link'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError } from '@/lib/api/client'
import { runCopy } from '@/lib/copy'
import { isRunActive, useRunPolling } from '@/hooks/useRunPolling'
import { RunProgress } from './RunProgress'
import { RunSummary } from './RunSummary'

export function RunView({ merchantId, runId }: { merchantId: string; runId: string }) {
  const { data: run, isLoading, isError, error, refetch } = useRunPolling(runId, merchantId)

  if (isLoading) return <Skeleton className="h-64 w-full" />

  if (isError || !run) {
    const apiError = error instanceof ApiError ? error : null
    return (
      <ErrorState
        message={apiError?.status === 404 ? 'This run could not be found.' : (apiError?.message ?? runCopy.unavailable)}
        requestId={apiError?.requestId}
        onRetry={() => refetch()}
      />
    )
  }

  if (run.status === 'failed' || run.status === 'timed_out') {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState message={runCopy.unavailable} />
        <Link className="text-caption text-brand underline" href={`/merchants/${merchantId}/upload`}>
          Back to upload
        </Link>
      </div>
    )
  }

  if (isRunActive(run.status)) return <RunProgress step={run.step} />

  return <RunSummary run={run} />
}
