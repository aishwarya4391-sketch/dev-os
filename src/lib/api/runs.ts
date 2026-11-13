import { apiFetch, jsonBody } from './client'
import type { Run } from '@/types/api'

/** Omit uploadId to reconcile the merchant's latest upload. */
export function startRun(merchantId: string, uploadId?: string): Promise<{ run_id: string; status: Run['status'] }> {
  return apiFetch(`/ui/merchants/${encodeURIComponent(merchantId)}/runs`, {
    method: 'POST',
    ...jsonBody(uploadId ? { upload_id: uploadId } : {}),
  })
}

export function getRun(runId: string): Promise<Run> {
  return apiFetch<Run>(`/ui/runs/${encodeURIComponent(runId)}`)
}
