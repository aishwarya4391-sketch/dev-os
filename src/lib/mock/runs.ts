import type { MerchantSummary, Run, RunStep, UploadResult } from '@/types/api'

// In-memory stand-in for upload and run state (local mock API only). Lives on globalThis so it
// survives dev-server module reloads. Demo hooks via the uploaded file's name:
//   "fail" -> the run fails, "rollback" -> the run finishes with a rolled-back batch,
//   "wrong-merchant" -> the upload is rejected as the wrong merchant.

type StoredUpload = { merchantId: string; filename: string; result: UploadResult }
type StoredRun = { runId: string; merchantId: string; filename: string; startedAt: number }

type MockState = { uploads: Map<string, StoredUpload>; runs: Map<string, StoredRun>; seq: number }
const g = globalThis as unknown as { __mockState?: MockState }
const state: MockState = (g.__mockState ??= {
  uploads: new Map<string, StoredUpload>(),
  runs: new Map<string, StoredRun>(),
  seq: 1,
})

const STEP_MS = 2000
const STEPS: RunStep[] = ['reading_upload', 'matching', 'staging', 'routing', 'committing', 'verifying']

export type ParsedUpload =
  | { ok: true; result: UploadResult }
  | { ok: false; status: number; code: string; message: string }

function rowsFromCsv(text: string): { row: number; price: string | undefined }[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const priceIdx = header.indexOf('price')
  return lines.slice(1).map((line, i) => ({
    row: i + 2,
    price: priceIdx >= 0 ? line.split(',')[priceIdx]?.trim() : '0',
  }))
}

function rowsFromJson(text: string): { row: number; price: string | undefined }[] | null {
  try {
    const parsed = JSON.parse(text)
    const items: unknown[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
    return items.map((item, i) => {
      const price = (item as { price?: unknown })?.price
      return { row: i + 1, price: price === undefined || price === null ? undefined : String(price) }
    })
  } catch {
    return null
  }
}

export function storeUpload(merchantId: string, filename: string, text: string): ParsedUpload {
  if (filename.toLowerCase().includes('wrong-merchant')) {
    return { ok: false, status: 422, code: 'wrong_merchant', message: 'File is for a different merchant.' }
  }
  const isJson = filename.toLowerCase().endsWith('.json')
  const rows = isJson ? rowsFromJson(text) : rowsFromCsv(text)
  if (rows === null) {
    return { ok: false, status: 422, code: 'unsupported_format', message: 'Could not read the file.' }
  }
  if (rows.length > 500) {
    return { ok: false, status: 422, code: 'validation_failed', message: 'The menu has more than 500 items.' }
  }

  const rejected_rows: UploadResult['rejected_rows'] = []
  for (const r of rows) {
    if (r.price === undefined || r.price === '') rejected_rows.push({ row: r.row, reason: 'price missing' })
    else if (Number.isNaN(Number(r.price))) rejected_rows.push({ row: r.row, reason: 'price is not a number' })
  }

  const upload_id = `up-${state.seq++}`
  const result: UploadResult = {
    upload_id,
    total_rows: rows.length,
    accepted_rows: rows.length - rejected_rows.length,
    rejected_rows,
  }
  state.uploads.set(upload_id, { merchantId, filename, result })
  return { ok: true, result }
}

export function rejectedRowsCsv(merchantId: string, uploadId: string): string | null {
  const u = state.uploads.get(uploadId)
  if (!u || u.merchantId !== merchantId) return null
  return ['row,reason', ...u.result.rejected_rows.map((r) => `${r.row},${r.reason}`)].join('\n') + '\n'
}

function latestUpload(merchantId: string): StoredUpload | undefined {
  return Array.from(state.uploads.values()).reverse().find((u) => u.merchantId === merchantId)
}

export function startMockRun(merchantId: string, uploadId?: string) {
  const upload = uploadId ? state.uploads.get(uploadId) : latestUpload(merchantId)
  const active = Array.from(state.runs.values()).find((r) => r.merchantId === merchantId && runView(r).status !== 'succeeded' && runView(r).status !== 'failed')
  if (active) return { error: { status: 409, code: 'run_in_progress', message: 'A run is already in progress.' } }
  if (!upload) return { error: { status: 409, code: 'no_upload', message: 'No upload found.' } }

  const runId = `run-${state.seq++}`
  state.runs.set(runId, { runId, merchantId, filename: upload?.filename ?? '', startedAt: Date.now() })
  return { runId }
}

function runView(r: StoredRun): Run {
  const elapsed = Date.now() - r.startedAt
  const name = r.filename.toLowerCase()
  const failAt = STEP_MS * 3
  const doneAt = STEP_MS * STEPS.length

  const base = {
    run_id: r.runId,
    merchant_id: r.merchantId,
    started_at: new Date(r.startedAt).toISOString(),
    audit_refs: [] as string[],
  }

  if (name.includes('fail') && elapsed >= failAt) {
    return {
      ...base, status: 'failed', step: 'staging', finished_at: new Date(r.startedAt + failAt).toISOString(),
      counts: { committed: 0, pending: 0, blocked: 0, skipped: 0, rolled_back: 0 },
      explanation: null, rolled_back: null,
    }
  }
  if (elapsed >= doneAt) {
    const rollback = name.includes('rollback')
    return {
      ...base, status: 'succeeded', step: 'done', finished_at: new Date(r.startedAt + doneAt).toISOString(),
      counts: rollback
        ? { committed: 0, pending: 3, blocked: 1, skipped: 2, rolled_back: 18 }
        : { committed: 12, pending: 4, blocked: 1, skipped: 3, rolled_back: 0 },
      explanation: rollback
        ? 'The batch of 18 price changes failed read-back verification, so all 18 items were restored to their previous values. 3 changes are waiting for your approval.'
        : '12 low-risk price and availability changes were applied. 4 changes need your approval because they are larger than 10% or confidence is below 0.95. 1 change was blocked by validation.',
      rolled_back: rollback ? { batch_id: 'batch-demo', items: 18, verified: true } : null,
      audit_refs: ['audit-demo-1'],
    }
  }
  return {
    ...base, status: elapsed < STEP_MS / 2 ? 'queued' : 'running',
    step: STEPS[Math.min(Math.floor(elapsed / STEP_MS), STEPS.length - 1)],
    finished_at: null,
    counts: { committed: 0, pending: 0, blocked: 0, skipped: 0, rolled_back: 0 },
    explanation: null, rolled_back: null,
  }
}

export function getMockRun(runId: string): Run | null {
  const r = state.runs.get(runId)
  return r ? runView(r) : null
}

/** Overlay uploads and runs made through the mock API onto the static merchant list. */
export function applyMockState(merchants: MerchantSummary[]): MerchantSummary[] {
  return merchants.map((m) => {
    const runs = Array.from(state.runs.values()).filter((r) => r.merchantId === m.merchant_id)
    const latest = runs[runs.length - 1]
    const view = latest ? runView(latest) : null
    const active = view && (view.status === 'queued' || view.status === 'running') ? view.run_id : null
    return {
      ...m,
      has_upload: m.has_upload || !!latestUpload(m.merchant_id),
      active_run_id: active ?? (latest ? null : m.active_run_id),
      last_run_at: view ? view.started_at : m.last_run_at,
      last_run_status: view ? view.status : m.last_run_status,
    }
  })
}
