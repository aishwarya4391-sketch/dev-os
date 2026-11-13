'use client'

import { useState } from 'react'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { downloadRejectedRows } from '@/lib/api/uploads'
import { uploadCopy } from '@/lib/copy'
import type { UploadResult as UploadResultData } from '@/types/api'
import { RejectedRowsTable } from './RejectedRowsTable'

export function UploadResult({ merchantId, result }: { merchantId: string; result: UploadResultData }) {
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const rejected = result.rejected_rows.length

  async function download() {
    setDownloadError(null)
    try {
      await downloadRejectedRows(merchantId, result.upload_id)
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Banner variant="success">{uploadCopy.accepted(result.accepted_rows, result.total_rows)}</Banner>
      {rejected > 0 && (
        <>
          <Banner variant="warning">{uploadCopy.rejectedRows(rejected)} Valid rows continue.</Banner>
          <RejectedRowsTable rows={result.rejected_rows} />
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={download}>
              Download rejected rows (CSV)
            </Button>
            {downloadError && <span className="text-caption text-danger-text">{downloadError}</span>}
          </div>
        </>
      )}
    </div>
  )
}
