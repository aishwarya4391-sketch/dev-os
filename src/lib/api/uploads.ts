import { apiDownload, apiFetch } from './client'
import type { UploadResult } from '@/types/api'

export function uploadPos(merchantId: string, file: File): Promise<UploadResult> {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<UploadResult>(`/ui/merchants/${encodeURIComponent(merchantId)}/uploads`, {
    method: 'POST',
    body,
    timeoutMs: 120_000,
  })
}

export function downloadRejectedRows(merchantId: string, uploadId: string): Promise<void> {
  return apiDownload(
    `/ui/merchants/${encodeURIComponent(merchantId)}/uploads/${encodeURIComponent(uploadId)}/rejected.csv`,
    `${merchantId}-rejected-rows.csv`
  )
}
