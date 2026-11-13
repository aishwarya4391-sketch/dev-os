# Spec: Web App API Contract (as consumed by the UI)

Traces to: FR-14, FR-15, FR-16, FR-18. Engineering doc §9.

## Client rules
- Single module `src/lib/api/client.ts` exporting `apiFetch<T>(path, init?)`.
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL`. JSON in/out except uploads (multipart) and CSV downloads.
- Header `Authorization: Bearer <Supabase access token>` on every `/ui/*` call. No `x-api-key` anywhere in this repo.
- Wire format is snake_case. `src/lib/api/*` maps to camelCase view types at the boundary.
- Timeout 30 s (upload 120 s). No automatic retry on POST/PUT. GET retries once on network error.

## Error envelope
```ts
type ApiErrorBody = { error: { code: string; message: string; details?: Record<string, unknown>; request_id: string } }
class ApiError extends Error { status: number; code: string; requestId: string; details?: Record<string, unknown> }
```
| Status | code | UI handling |
|---|---|---|
| 401 | `unauthenticated` | sign out → `/login` |
| 403 | `forbidden` | `/access-denied` or inline "You don't have access to this." |
| 404 | `not_found` | not-found page |
| 409 | `run_in_progress`, `no_upload`, `blocked`, `expired_restaged`, `writes_paused` | state-specific copy (see ux-states spec) |
| 413 | `file_too_large` | upload error |
| 422 | `wrong_merchant`, `unsupported_format`, `validation_failed` | inline field errors |
| 429 | `rate_limited` | toast + backoff |
| 503 | `agent_unavailable`, `writes_paused` | state-specific banner |

## Types (`src/types/api.ts`)
```ts
export type Role = 'specialist' | 'lead' | 'admin'
export type Autonomy = 'shadow' | 'suggest' | 'auto_low_risk'
export type ChangeField = 'price' | 'availability'
export type Availability = 'available' | 'unavailable'
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'timed_out'
export type RunStep = 'reading_upload' | 'matching' | 'staging' | 'routing' | 'committing' | 'verifying' | 'done'
export type ChangeState = 'pending' | 'blocked' | 'expired' | 'committed' | 'rejected' | 'restaged' | 'rolled_back'
export type AuditStatus = 'committed' | 'rolled_back' | 'blocked' | 'skipped' | 'rejected'
export type AuditRoute = 'auto' | 'approval' | 'skip'

export interface Me { user_id: string; email: string; role: Role }

export interface MerchantSummary {
  merchant_id: string; name: string; autonomy: Autonomy
  last_run_at: string | null; last_run_status: RunStatus | null
  pending_count: number; has_upload: boolean; active_run_id: string | null
}

export interface UploadResult {
  upload_id: string; total_rows: number; accepted_rows: number
  rejected_rows: { row: number; reason: string }[]
}

export interface Run {
  run_id: string; merchant_id: string; status: RunStatus; step: RunStep
  started_at: string; finished_at: string | null
  counts: { committed: number; pending: number; blocked: number; skipped: number; rolled_back: number }
  explanation: string | null
  rolled_back: { batch_id: string; items: number; verified: boolean } | null
  audit_refs: string[]
}

export interface ReviewChange {
  change_id: string; field: ChangeField; item_name: string
  pos_row_id: string; catalog_item_id: string
  before: string | number; after: string | number
  evidence: string; reason_code: string; agent_reason: string
  confidence: number; route: AuditRoute; state: ChangeState
  blocked_rule_id: string | null; blocked_reason: string | null
  age_seconds: number; expires_at: string
}
export interface ReviewTier { tier: 'high_risk' | 'medium_confidence'; changes: ReviewChange[] }
export interface ReviewQueue {
  merchant_id: string; autonomy: Autonomy; tiers: ReviewTier[]
  needs_info: { pos_row_id: string; item_name: string; reason: string }[]
}

export type DecisionRequest =
  | { action: 'approve' }
  | { action: 'reject'; reason: string }
  | { action: 'edit'; edited_value: number | Availability }
export interface DecisionResult {
  change_id: string; state: ChangeState; audit_id: string; alias_saved: boolean
}
export interface BulkDecisionRequest { change_ids: string[]; action: 'approve'; tier: ReviewTier['tier'] }
export interface BulkDecisionResult { results: (DecisionResult | { change_id: string; error: ApiErrorBody['error'] })[] }

export interface AuditRow {
  audit_id: string; timestamp: string; merchant_id: string; run_id: string; change_id: string
  item_ids: string; before: unknown; after: unknown; evidence: string
  confidence: number; risk_tier: string; route: AuditRoute; approver: string | null
  validation_result: string; status: AuditStatus; model_version: string; policy_version: string
}
export interface AuditPage { rows: AuditRow[]; page: number; total: number }
export interface KillSwitch { writes_paused: boolean; set_by: string | null; set_at: string | null }
```

## Endpoint functions (`src/lib/api/`)
| Function | Method + path | Role |
|---|---|---|
| `getMe()` | GET `/ui/me` | any |
| `listMerchants()` | GET `/ui/merchants` | S |
| `uploadPos(merchantId, file)` | POST `/ui/merchants/{id}/uploads` (multipart `file`) | S |
| `getRejectedRowsCsvUrl(merchantId, uploadId)` | GET `/ui/merchants/{id}/uploads/{uploadId}/rejected.csv` | S |
| `startRun(merchantId, uploadId)` | POST `/ui/merchants/{id}/runs` `{upload_id?}` (omit = latest upload) → 202 `{run_id, status}` | S |
| `getRun(runId)` | GET `/ui/runs/{runId}` | S |
| `getReviewQueue(merchantId)` | GET `/ui/merchants/{id}/review` | S |
| `decideChange(changeId, body)` | POST `/ui/changes/{changeId}/decision` | S |
| `bulkDecide(body)` | POST `/ui/changes/bulk-decision` (max 100, one tier) | S |
| `getAudit(merchantId, params)` | GET `/ui/merchants/{id}/audit?from&to&status&route&q&page&page_size≤100` | S |
| `getAuditCsvUrl(merchantId, params)` | GET `/ui/merchants/{id}/audit.csv` | S |
| `setAutonomy(merchantId, autonomy)` | PUT `/ui/merchants/{id}/autonomy` | L |
| `getKillSwitch()` / `setKillSwitch(paused)` | GET/PUT `/ui/settings/kill-switch` | S read, L write |
| `getMetrics()` | GET `/ui/metrics` (MVP 1) | L |
| `listExceptions` / `addException` / `removeException` | `/ui/merchants/{id}/exceptions` (MVP 1) | L |
| `injectFailure(body)` | POST `/ui/demo/inject-failure` `{merchant_id, mode: 'api_error'|'readback_mismatch'|'partial_batch'}` | A |

CSV downloads fetch with the bearer token and save the blob (not a bare `<a href>`).

## Edit validation (client, mirrors server)
- Price: number > 0, max 2 decimals, within 0.2×–5× of `before`; otherwise show the server rule message if rejected.
- Reject requires non-empty reason (≤500 chars).

## Mock layer
MSW handlers in `tests/mocks/handlers.ts` implement every endpoint above with fixtures, so the UI runs before the web app endpoints exist (`NEXT_PUBLIC_API_BASE_URL` pointing to the MSW dev server in `npm run dev:mock`).
