// Wire types for the Azure web app's /ui/* API (docs/specs/api-contract.md). Wire format is snake_case.
export type Role = 'specialist' | 'lead' | 'admin'
export type Autonomy = 'shadow' | 'suggest' | 'auto_low_risk'
export type ChangeField = 'price' | 'availability'
export type Availability = 'available' | 'unavailable'
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'timed_out'
export type RunStep =
  | 'reading_upload'
  | 'matching'
  | 'staging'
  | 'routing'
  | 'committing'
  | 'verifying'
  | 'done'
export type ChangeState =
  | 'pending'
  | 'blocked'
  | 'expired'
  | 'committed'
  | 'rejected'
  | 'restaged'
  | 'rolled_back'
export type AuditStatus = 'committed' | 'rolled_back' | 'blocked' | 'skipped' | 'rejected'
export type AuditRoute = 'auto' | 'approval' | 'skip'

export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, unknown>; request_id: string }
}

export interface Me {
  user_id: string
  email: string
  role: Role
}

export interface MerchantSummary {
  merchant_id: string
  name: string
  autonomy: Autonomy
  last_run_at: string | null
  last_run_status: RunStatus | null
  pending_count: number
  has_upload: boolean
  active_run_id: string | null
}

export interface MerchantList {
  merchants: MerchantSummary[]
}

export interface UploadResult {
  upload_id: string
  total_rows: number
  accepted_rows: number
  rejected_rows: { row: number; reason: string }[]
}

export interface Run {
  run_id: string
  merchant_id: string
  status: RunStatus
  step: RunStep
  started_at: string
  finished_at: string | null
  counts: { committed: number; pending: number; blocked: number; skipped: number; rolled_back: number }
  explanation: string | null
  rolled_back: { batch_id: string; items: number; verified: boolean } | null
  audit_refs: string[]
}

export interface ReviewChange {
  change_id: string
  field: ChangeField
  item_name: string
  pos_row_id: string
  catalog_item_id: string
  before: string | number
  after: string | number
  evidence: string
  reason_code: string
  agent_reason: string
  confidence: number
  route: AuditRoute
  state: ChangeState
  blocked_rule_id: string | null
  blocked_reason: string | null
  age_seconds: number
  expires_at: string
}
export interface ReviewTier {
  tier: 'high_risk' | 'medium_confidence'
  changes: ReviewChange[]
}
export interface ReviewQueue {
  merchant_id: string
  autonomy: Autonomy
  tiers: ReviewTier[]
  needs_info: { pos_row_id: string; item_name: string; reason: string }[]
}

export type DecisionRequest =
  | { action: 'approve' }
  | { action: 'reject'; reason: string }
  | { action: 'edit'; edited_value: number | Availability }
export interface DecisionResult {
  change_id: string
  state: ChangeState
  audit_id: string
  alias_saved: boolean
}
export interface BulkDecisionRequest {
  change_ids: string[]
  action: 'approve'
  tier: ReviewTier['tier']
}
export interface BulkDecisionResult {
  results: (DecisionResult | { change_id: string; error: ApiErrorBody['error'] })[]
}

export interface AuditRow {
  audit_id: string
  timestamp: string
  merchant_id: string
  run_id: string
  change_id: string
  item_ids: string
  before: unknown
  after: unknown
  evidence: string
  confidence: number
  risk_tier: string
  route: AuditRoute
  approver: string | null
  validation_result: string
  status: AuditStatus
  model_version: string
  policy_version: string
}
export interface AuditPage {
  rows: AuditRow[]
  page: number
  total: number
}
export interface KillSwitch {
  writes_paused: boolean
  set_by: string | null
  set_at: string | null
}
