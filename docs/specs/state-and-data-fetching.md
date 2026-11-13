# Spec: State Management and Data Fetching

Engineering doc §5.1. Server state: TanStack Query. Client state: minimal.

## Query client defaults
`staleTime: 15_000`, `gcTime: 300_000`, `retry: 1` for GET, `refetchOnWindowFocus: true`, mutations `retry: 0`. Cleared on sign-out.

## Query keys (`src/lib/api/keys.ts`)
| Key | Used by |
|---|---|
| `['me']` | `useRole` |
| `['merchants']` | `useMerchants` |
| `['run', runId]` | `useRunPolling` |
| `['review', merchantId]` | `useReviewQueue` |
| `['audit', merchantId, filters]` | `useAudit` |
| `['kill-switch']` | `useKillSwitch` (poll 10 s) |
| `['metrics']` | `useMetrics` |

## Hooks (`src/hooks/`)
| Hook | Behavior |
|---|---|
| `useMerchants()` | GET list; refetch on focus |
| `useUpload(merchantId)` | Mutation; on success invalidate `['merchants']`; exposes progress |
| `useStartRun(merchantId)` | Mutation; on success navigate to run page; on 409 `run_in_progress` show existing run link |
| `useRunPolling(runId)` | `refetchInterval` = poll interval while `queued|running`, else `false`; pauses when document hidden; on terminal invalidates `['merchants']` and `['review', merchantId]` |
| `useReviewQueue(merchantId)` | GET; `refetchInterval` 30 s |
| `useDecision()` | Mutation; optimistic row state (`pending → approving`); on error revert and show message; on success invalidate `['review', id]`, `['merchants']`, `['audit', id]`; 409 `expired_restaged` → refetch + banner |
| `useBulkDecision()` | As above for many rows; shows per-row failures list |
| `useAudit(merchantId, filters)` | Paged, `keepPreviousData` |
| `useSetAutonomy()` | Mutation; invalidate `['merchants']` |
| `useKillSwitch()` | GET poll 10 s; `useSetKillSwitch()` mutation, no optimistic update (wait for server) |
| `useRole()` | From `['me']` + session |

## Client state
- Session/role: Supabase session in cookies; `SessionProvider` exposes `user`, `role`.
- Review selection: Zustand store `useReviewSelection` `{ selectedIds, tier, toggle(id, tier), clear() }`; cleared on merchant change, after bulk action, and when the tier differs.
- UI prefs (collapsed tiers, last filters): `localStorage` wrapped in try/catch; never required for correctness.

## Rules
- Commit outcomes, counts and values are always taken from server responses, never computed in the client.
- Never cache the agent explanation beyond the run query.
- Optimistic updates are limited to row-level visual state on approve/reject/edit.
- All mutations that write are blocked client-side (button disabled, banner shown) when `writes_paused` is true, but the server decision is final.
