# Spec: Authentication and Roles

Traces to: FR-17, US-15, US-11a. Engineering doc §3, §5.3, §7.3.

## Provider
Supabase Auth, email + password, email verification required. Supabase holds identity only.

## Packages
`@supabase/supabase-js`, `@supabase/ssr`.

## Roles
| Role | Source | Can |
|---|---|---|
| `specialist` | `app_metadata.role` (default at sign-up via `handle_new_user`) | Merchants, upload, reconcile, review, history |
| `lead` | set via `set_user_role` or SQL | + autonomy, kill switch, dashboard, exceptions |
| `admin` | bootstrap SQL | + `/admin/demo`, grant roles |

Role hierarchy: `admin` ⊃ `lead` ⊃ `specialist`. Helper `hasRole(userRole, required)` returns true if rank(userRole) ≥ rank(required).

## Files
| File | Responsibility |
|---|---|
| `src/lib/auth/supabase-browser.ts` | `createBrowserClient(url, anonKey)` |
| `src/lib/auth/supabase-server.ts` | `createServerClient` using Next `cookies()` |
| `src/lib/auth/roles.ts` | `type Role`, `ROLE_RANK`, `hasRole`, `roleFromSession(session)` (reads `session.user.app_metadata.role`; missing → `null`) |
| `src/middleware.ts` | Refresh session cookies; apply guard table below |
| `src/app/auth/callback/route.ts` | Exchange `code` for session after email verification, redirect to `/merchants` |
| `src/hooks/useRole.ts` | Client hook returning `{ role, isLead, isAdmin, loading }` |
| `src/lib/api/client.ts` | Attaches `Authorization: Bearer <access_token>`; on 401 signs out and redirects to `/login` |

## Route guard table (middleware)
| Path pattern | Requirement | Failure |
|---|---|---|
| `/login`, `/signup`, `/verify`, `/auth/callback` | public; if already signed in and verified → redirect `/merchants` | — |
| `/merchants/**` | session + `email_confirmed_at` + any role | no session → `/login?next=<path>`; unverified → `/verify`; no role → `/access-denied` |
| `/settings/**` | role ≥ `lead` | `/access-denied` |
| `/admin/**` | role = `admin` and `NEXT_PUBLIC_ENABLE_DEMO_CONTROLS === "true"` | `/access-denied` |
| `/` | redirect to `/merchants` if signed in else `/login` | — |

The UI guard is UX only; the web app re-verifies JWT and role on every call.

## Forms
Zod schemas in `src/lib/validation/auth.ts`:
- Email: valid format, max 254.
- Password (sign-up): min 10 chars, at least one letter and one digit. Sign-in: non-empty.
- Sign-up confirm password must match.

## Error copy
| Case | Message |
|---|---|
| Wrong credentials | "Invalid email or password." |
| Email not verified | "Verify your email to continue." + resend link button |
| Email already registered | "An account with this email already exists." |
| Network | "Can't reach the sign-in service. Try again." |
| No role / forbidden | "You don't have access to this." |

## Session behavior
- Cookie session via `@supabase/ssr`; refresh in middleware.
- Sign out clears session and React Query cache, then goes to `/login`.
- Token expiry mid-request: one silent refresh + retry; if it fails → `/login`.

## Acceptance
- Unauthenticated request to any `/merchants/**` route never renders data.
- A `specialist` opening `/settings` lands on `/access-denied`.
- Browser bundle contains only `NEXT_PUBLIC_*` values (checked in CI).
