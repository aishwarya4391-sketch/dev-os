'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Banner } from '@/components/ui/Banner'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError } from '@/lib/api/client'
import { uploadCopy } from '@/lib/copy'
import { validateUploadFile } from '@/lib/validation/upload'
import { useMerchants } from '@/hooks/useMerchants'
import { useStartRun } from '@/hooks/useStartRun'
import { useUpload } from '@/hooks/useUpload'
import type { UploadResult as UploadResultData } from '@/types/api'
import { FileDropzone } from './FileDropzone'
import { ReconcileButton } from './ReconcileButton'
import { UploadResult } from './UploadResult'

function uploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'wrong_merchant') return uploadCopy.wrongMerchant
    if (error.code === 'file_too_large' || error.code === 'unsupported_format') return uploadCopy.invalidFile
    return error.message
  }
  return 'Upload failed. Try again.'
}

export function UploadView({ merchantId }: { merchantId: string }) {
  const merchants = useMerchants()
  const upload = useUpload(merchantId)
  const startRun = useStartRun(merchantId)
  const [fileError, setFileError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResultData | null>(null)

  if (merchants.isLoading) return <Skeleton className="h-48 w-full" />
  if (merchants.isError) {
    return <ErrorState message="We couldn't load this merchant. Try again." onRetry={() => merchants.refetch()} />
  }

  const merchant = merchants.data?.find((m) => m.merchant_id === merchantId)
  if (!merchant) {
    return (
      <ErrorState message="This merchant isn't in your book." />
    )
  }

  function onFile(file: File) {
    setFileError(null)
    const problem = validateUploadFile(file)
    if (problem) {
      setFileError(problem)
      return
    }
    upload.mutate(file, { onSuccess: (data) => setResult(data) })
  }

  const hasUpload = merchant.has_upload || result !== null
  const runError =
    startRun.error instanceof ApiError
      ? startRun.error.code === 'run_in_progress'
        ? uploadCopy.runInProgress(merchantId)
        : startRun.error.code === 'no_upload'
          ? uploadCopy.noUpload(merchantId)
          : startRun.error.message
      : startRun.error
        ? 'Could not start the run. Try again.'
        : null

  return (
    <div className="flex flex-col gap-6">
      {merchant.autonomy === 'shadow' && (
        <Banner variant="info">This merchant is in shadow mode. Nothing will be written.</Banner>
      )}

      <FileDropzone onFile={onFile} busy={upload.isPending} disabled={upload.isPending} />

      {fileError && <Banner variant="danger">{fileError}</Banner>}
      {upload.isError && <Banner variant="danger">{uploadErrorMessage(upload.error)}</Banner>}
      {result && <UploadResult merchantId={merchantId} result={result} />}

      <div className="flex flex-col gap-3">
        <ReconcileButton
          merchantId={merchantId}
          hasUpload={hasUpload}
          activeRunId={merchant.active_run_id}
          pending={startRun.isPending}
          onClick={() => startRun.mutate(result?.upload_id)}
        />
        {runError && <Banner variant="danger">{runError}</Banner>}
        {merchant.active_run_id && (
          <Link
            className="text-caption text-brand underline"
            href={`/merchants/${merchantId}/runs/${merchant.active_run_id}`}
          >
            View the run in progress
          </Link>
        )}
      </div>
    </div>
  )
}
