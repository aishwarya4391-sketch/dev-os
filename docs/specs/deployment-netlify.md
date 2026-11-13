# Spec: Deployment (Netlify) and Project Conventions

Engineering doc §11, §12. Constraint: Netlify Free = 300 credits/month, 15 credits per production deploy (~20 deploys/month) `[Verify]`.

## Netlify
- Repo connected to GitHub; production branch `main`; deploy previews disabled (conserve credits) unless needed.
- `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```
- Environment variables (Site configuration > Environment variables): all `NEXT_PUBLIC_*` from `.env.example`.
- Batch UI changes into fewer merges to main.

## Security headers (`next.config.mjs` headers())
- `Content-Security-Policy`: `default-src 'self'; connect-src 'self' ${SUPABASE_URL} ${API_BASE_URL}; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'` (Next dev adds `'unsafe-eval'` in development only).
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

## Web app prerequisites (external)
- CORS allow-list contains only the Netlify origin.
- Supabase JWT verification and `/ui/*` endpoints from `api-contract.md`.
- Supabase project unpaused before demos (free projects pause after 1 week).

## Supabase setup steps
1. Create project; copy URL + anon key to env.
2. Auth > Providers: enable Email, "Confirm email" ON.
3. Auth > URL configuration: Site URL = `NEXT_PUBLIC_APP_URL`; redirect `.../auth/callback`.
4. Run `docs/specs/supabase-schema.sql` in the SQL Editor; run the bootstrap-admin statement once.

## Naming conventions
As in engineering doc §12: PascalCase components, `useX` hooks, kebab-case route folders, snake_case wire fields mapped to camelCase in `lib/api`, `NEXT_PUBLIC_` prefix for browser-safe env vars.

## Folder structure
As in engineering doc §11 (`src/app`, `src/components/{ui,layout,merchants,upload,run,review,history,settings,admin}`, `src/lib/{api,auth,validation,format}`, `src/hooks`, `src/types`, `src/middleware.ts`, `src/styles/tokens.css`, `tests/`).

## Dependencies (to install in Stage 3)
Runtime: `next@14`, `react@18`, `react-dom@18`, `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`, `@tanstack/react-table`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@radix-ui/react-dialog`, `-dropdown-menu`, `-tabs`, `-tooltip`, `-select`, `-checkbox`, `lucide-react`, `clsx`, `tailwind-merge`.
Dev: `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `msw`, `@playwright/test`, `@axe-core/playwright`.
