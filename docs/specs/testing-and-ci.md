# Spec: Testing and CI

Engineering doc §13.

## Tooling
Vitest + React Testing Library (unit/integration), MSW (API mocks, shared with dev), Playwright (E2E), `@axe-core/playwright` (a11y), ESLint + `tsc --noEmit`.

## npm scripts
`dev`, `dev:mock` (MSW server + `NEXT_PUBLIC_API_BASE_URL=http://localhost:4010`), `build`, `start`, `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright).

## Layout
`tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/mocks/{handlers.ts,fixtures/*.ts}`.

## Required tests
| Level | Cases |
|---|---|
| Unit | `hasRole` rank logic; `roleFromSession`; Zod schemas (auth, upload, edit price: >0, ≤2 decimals, 0.2×–5×); `formatMoney`, `formatConfidence`, relative time; API client error mapping for 401/403/409/422/429/503; copy functions |
| Integration (MSW) | Merchants list + empty; upload success, partial reject, wrong merchant, too large; start run + 409; run polling through each step to success, failed, timeout, rolled back; review approve/reject/edit; blocked and expired rows; bulk approve same-tier rule; audit filters + CSV; autonomy change (lead) vs forbidden (specialist); kill switch banner; access denied |
| E2E | Sign-in → merchants; role gating (`/settings`, `/admin/demo`); upload → reconcile → approve → audit row visible; reject → "Saved for next time"; rolled-back banner; writes paused banner disables approve; expired change re-staged message |
| A11y | Axe on every route, 0 serious/critical; keyboard-only review flow (A/R/E) |
| Security | CI grep that the built bundle contains no `x-api-key`, `service_role`, Airtable or Foundry strings |

## Coverage targets
`lib/` and `hooks/` ≥85% lines; components ≥70%; all P0 flows covered by E2E.

## CI (`.github/workflows/ci.yml`)
On PR and push to `main`: install → lint → typecheck → unit+integration → build → (main only) Playwright against the mock server. Netlify deploys only after CI passes (protected `main`).

## Out of scope for this repo
Backend unit tests, gold-set evaluation (precision, recall, ECE), shadow-mode runs, rollback drills against the real API.
