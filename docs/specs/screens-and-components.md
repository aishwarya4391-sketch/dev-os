# Spec: Screens and Components

Traces to: US-1, US-3, US-5, US-7, US-8, US-9, US-10, US-11a/b, US-15. Engineering doc §4, §5.
All visual styling (colors, spacing, type, components) comes from `docs/design.md` via `src/styles/tokens.css`. Do not hardcode values.

## Screen inventory
| Route | Component tree | Data | P |
|---|---|---|---|
| `/login`, `/signup`, `/verify` | `AuthLayout > LoginForm \| SignupForm \| VerifyNotice` | Supabase | P0 |
| `/merchants` | `MerchantTable > AutonomyBadge, PendingCount, RowActions` | `useMerchants` | P0 |
| `/merchants/[id]/upload` | `FileDropzone, UploadResult, RejectedRowsTable, ReconcileButton` | `useUpload`, `useStartRun` | P0 |
| `/merchants/[id]/runs/[runId]` | `RunProgress, RunSummary > CountCards, AgentExplanation, RollbackBanner` | `useRunPolling` | P0 |
| `/merchants/[id]/review` | `ReviewQueue > TierGroup > ChangeRow > EvidencePanel, ConfidenceChip, RiskChip, DecisionActions`, `EditChangeDialog`, `BulkApproveBar`, `NeedsInfoList` | `useReviewQueue`, `useDecision` | P0 |
| `/merchants/[id]/history` | `AuditFilters, AuditTable, ExportCsvButton` | `useAudit` | P0 |
| `/settings` | `AutonomyTable > AutonomySelect` | `useMerchants`, `useSetAutonomy` | P0 |
| `/settings/dashboard` | `KillSwitchToggle, MetricsDashboard` | `useKillSwitch`, `useMetrics` | P1 |
| `/admin/demo` | `FailureInjectionForm` | `useInjectFailure` | capstone |
| `/access-denied` | `AccessDenied` | none | P0 |

## Layout
- `AppShell`: `TopBar` (app name, user email, role badge, sign-out), `SideNav` (Merchants, Settings [lead+], Demo [admin+flag]), `WritesPausedBanner` above content, main content region.
- Desktop-first. Below `md`, `SideNav` becomes a drawer and tables become card lists.

## Behaviors per screen

### Merchants
Columns: merchant, autonomy badge, last run (relative time + status), pending approvals (links to review), actions (Upload, Review, History). Sort by pending desc by default. Search box filters by name/ID client-side.

### Upload
- Accept `.csv`, `.json`, ≤5 MB; reject others client-side with message before any request.
- After success show accepted/rejected counts and a rejected rows table (row, reason) with "Download rejected rows (CSV)".
- `ReconcileButton`: disabled (with tooltip text "Upload a POS export for M-1001 first.") unless an upload exists for the merchant; disabled with "A run for M-1001 is already in progress." if `active_run_id`.
- Click → `startRun` → navigate to `/merchants/[id]/runs/[runId]`.

### Run
- `RunProgress`: ordered stepper over `RunStep`; current step highlighted; `aria-live="polite"`.
- Polls `getRun` every `NEXT_PUBLIC_API_POLL_INTERVAL_MS` (default 2000) while status is `queued|running`; stops on terminal; stops when tab hidden, resumes on focus.
- Terminal `succeeded`: `RunSummary` with the five counts, `AgentExplanation` (plain text, label "AI-generated explanation"), links to audit rows and review queue.
- `failed`/`timed_out`: "We couldn't finish this run. Nothing was changed. Try again in a few minutes."
- `rolled_back` present: `RollbackBanner` "This batch was rolled back. All N items are back to their previous values (verified)." (omit "(verified)" if `verified=false` and show warning style).

### Review queue
- Tiers: "High risk", "Needs confirmation (0.80–0.95)". Each `ChangeRow`: item name, field, before → after, confidence chip, risk chip, age, evidence expander (POS row ID, catalog ID, evidence, reason code, agent reason).
- Actions per row: Approve, Reject (opens reason input), Edit (`EditChangeDialog`). Keyboard: focused row + `A`/`R`/`E`; `?` opens shortcut help.
- Bulk: checkbox per row; `BulkApproveBar` appears when ≥1 selected, only same-tier selection allowed, max 100.
- `blocked` rows show rule ID + reason and no approve/edit; `expired` rows show "This change is out of date because the POS or menu changed. It has been re-staged." and refetch.
- After a decision show toast with outcome; if `alias_saved` add "Saved for next time".
- `NeedsInfoList`: "We couldn't match these N POS items with confidence. Add an alias or skip." (alias action is MVP 1; MVP shows items read-only).
- Shadow merchants: banner "This merchant is in shadow mode. Nothing will be written."

### History
Filters: date range, status, route, free-text. Table columns: time, item, before → after, route, confidence, approver, status, validation result. Page size 25. Export applies the current filters.

### Settings
Lead only. Table of merchants with `AutonomySelect` (confirm dialog when widening, e.g. suggest → auto_low_risk: "This merchant's low-risk changes will be applied without review."). Kill switch toggle (MVP 1) with confirm dialog; reflected in global banner within one poll cycle (10 s max).

### Demo (admin, capstone)
Merchant select + failure mode select + "Inject failure for next commit". Shows red "Demo only" banner.

## Shared components (`src/components/ui`)
Button, IconButton, Badge, Chip, Card, Dialog, Drawer, Tooltip, Toast, Table, Tabs, Select, Checkbox, Input, FileDropzone, Skeleton, EmptyState, ErrorState, Banner (variants: info, warning, danger, success), Stepper. Built on Radix primitives and design tokens.

## Accessibility
WCAG 2.1 AA; every action reachable by keyboard; visible focus; dialogs trap focus and restore it; risk and status never color-only (icon + text); `aria-live` for run status and banners; min 4.5:1 contrast.
