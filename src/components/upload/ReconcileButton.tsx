'use client'

import { Button } from '@/components/ui/Button'
import { uploadCopy } from '@/lib/copy'

export function ReconcileButton({
  merchantId,
  hasUpload,
  activeRunId,
  pending,
  onClick,
}: {
  merchantId: string
  hasUpload: boolean
  activeRunId: string | null
  pending: boolean
  onClick: () => void
}) {
  const helper = activeRunId
    ? uploadCopy.runInProgress(merchantId)
    : !hasUpload
      ? uploadCopy.noUpload(merchantId)
      : null
  const disabled = pending || !hasUpload || !!activeRunId

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button onClick={onClick} disabled={disabled} aria-describedby={helper ? 'reconcile-helper' : undefined}>
          {pending ? 'Starting…' : 'Reconcile'}
        </Button>
      </div>
      {helper && (
        <p id="reconcile-helper" className="text-caption text-text-secondary">
          {helper}
        </p>
      )}
    </div>
  )
}
