# Spec: UX States and Copy

Source: PRD "Empty and error states" table (copy marked [Proposed] there). Every state below must have a component, a test and (where noted) an `aria-live` announcement.

| ID | State | Trigger | Component | Copy | Behavior |
|---|---|---|---|---|---|
| S1 | Nothing to review | Queue empty | `EmptyState` | "No changes need your review for {merchantId}. {n} low-risk changes were applied." | Link "View run summary" |
| S2 | No upload found | `has_upload=false` | `ReconcileButton` disabled | "Upload a POS export for {merchantId} first." | Tooltip + helper text |
| S3 | Agent unavailable | Run `failed`/`timed_out` or 503 `agent_unavailable` | `ErrorState` | "We couldn't finish this run. Nothing was changed. Try again in a few minutes." | "Try again" button; review of staged items still available |
| S4 | Run in progress | 409 `run_in_progress` or `active_run_id` | Inline notice | "A run for {merchantId} is already in progress." | Link to the active run |
| S5 | Rows rejected | `rejected_rows.length>0` | `RejectedRowsTable` | "{n} rows were rejected." plus per-row reason (e.g. "price missing", "unknown column") | CSV download; valid rows continue |
| S6 | Needs info | `needs_info` non-empty | `NeedsInfoList` | "We couldn't match these {n} POS items with confidence. Add an alias or skip." | Listed separately from approvals |
| S7 | Validation blocked | `state=blocked` | Row with `blocked_rule_id` | Rule ID + reason, e.g. "Price is 6× the last known price (limit 5×)." | No approve/edit action |
| S8 | Batch rolled back | `run.rolled_back` | `RollbackBanner` (danger) | "This batch was rolled back. All {n} items are back to their previous values (verified)." | Link to audit rows |
| S9 | Approval expired | `state=expired` or 409 `expired_restaged` | Inline notice | "This change is out of date because the POS or menu changed. It has been re-staged." | Auto refetch |
| S10 | Writes paused | `writes_paused=true` | `WritesPausedBanner` (global, warning) | "Writes are paused by your team lead. You can still review, but nothing will be applied." | Disable approve/commit actions |
| S11 | Access denied | 401/403, no role | `AccessDenied` page | "You don't have access to this." | No merchant data rendered |
| S12 | Shadow mode | merchant `autonomy=shadow` | Info banner | "This merchant is in shadow mode. Nothing will be written." | — |
| S13 | Upload invalid file | wrong type/size | Inline error | "Upload a CSV or JSON file up to 5 MB." | No request sent |
| S14 | Wrong merchant | 422 `wrong_merchant` | Inline error | "This file is for a different merchant. Check the merchant ID and try again." | — |
| S15 | Network error | fetch failure | `ErrorState` | "Can't reach the server. Check your connection and try again." | Retry |
| S16 | Rate limited | 429 | Toast | "Too many requests. Wait a moment and try again." | Backoff |

## Loading
Skeletons for tables/cards; spinner only inside buttons during mutations; run progress uses the stepper (never a blank screen).

## Rules
- Copy lives in `src/lib/copy.ts` (single source), with placeholders filled via typed functions.
- Error messages never expose request internals; show `request_id` in a "Details" disclosure for support.
- Banners are announced via `role="status"` (info/warning) or `role="alert"` (danger).
