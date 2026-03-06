# ADR-0011: Verification & Deployment Readiness

**Status:** Accepted
**Date:** 2026-03-03
**Phase:** 9 — Verification & Deployment Readiness

## Context

Phases 0–8 delivered 21 buildable workspaces (6 packages, 13 apps, 1 backend) with 3 CI/CD workflows and a single smoke E2E test. Phase 9 must validate the entire foundation, prepare the PWA for production deployment on Vercel, and establish the incremental domain migration strategy per Blueprint §6.

Key gaps addressed:

- Dev-harness had no automated verification (13 tabs untested)
- PWA lacked Vercel SPA configuration (no catch-all rewrite for client-side routing)
- Auth/adapter modes were hard-coded for production builds (no way to deploy with mock auth)
- No migration runbook existed for the MVP domain rollout
- E2E coverage was limited to a single smoke test

## Decision

### 1. E2E expansion strategy

**Multi-project Playwright config** — Two test projects (`chromium` for PWA, `dev-harness` for harness) with independent web servers and base URLs. This keeps test files focused and allows running subsets independently.

**Dev-harness coverage** — Tests iterate over all 13 tabs from `TabRouter.tsx`, clicking each and asserting non-empty content with no error boundary fallback. DevControls theme toggle is tested separately.

**PWA navigation coverage** — Tests verify root load plus all 5 MVP routes (`/project-hub`, `/accounting`, `/estimating`, `/leadership`, `/business-development`) and shell header visibility.

### 2. Vercel SPA configuration

- **`framework: null`** prevents Vercel from auto-detecting Next.js in the monorepo root
- **Catch-all rewrite** (`/(.*) → /index.html`) enables TanStack Router client-side navigation
- **Immutable caching** on `/assets/*` (Vite generates hashed filenames)
- **No-cache on `/sw.js`** ensures service worker updates propagate immediately

### 3. Auth mode configurability

The `define` block in `apps/pwa/vite.config.ts` now reads `VITE_AUTH_MODE` and `VITE_ADAPTER_MODE` environment variables with fallbacks:

- Development: defaults to `mock`/`mock`
- Production: defaults to `msal`/`proxy`

This enables initial Vercel deployment with `VITE_AUTH_MODE=mock` (no Azure AD dependency), then switching to `msal` when the Azure AD tenant is configured — no code change or rebuild of application source required (only a Vercel env var change and redeploy).

### 4. SPFx iframe testing approach

Per ADR-0007, `.sppkg` packaging is deferred. "Test catalog deployment" uses iframe embedding: build with Vite, deploy `dist/` to a static host, embed in SharePoint via the Embed webpart. This validates rendering and data flow without the full SPFx packaging toolchain.

### 5. Incremental migration kickoff

The domain migration runbook establishes the MVP priority order (Accounting → Estimating → Project Hub → Leadership → Business Development) with a per-domain checklist covering implementation, verification, and cutover phases. Each domain migration is independently reversible.

## Consequences

- Dev-harness tabs are now verified on every CI run — regressions in any of the 13 domain previews will be caught.
- PWA can be deployed to Vercel immediately with mock auth, removing the Azure AD dependency for initial testing.
- Switching auth modes requires only a Vercel env var change — no code changes.
- The migration runbook provides a repeatable process for each domain cutover.
- E2E test count increases from 1 to ~22 (13 tabs + 1 theme toggle + 1 root load + 5 MVP routes + 1 header + existing smoke).

## Alternatives Considered

- **Single Playwright project for all tests** — Rejected; separate projects allow independent web servers and clearer test organization.
- **Deploy PWA to Azure Static Web Apps** — Deferred; Vercel is already configured in CD pipeline (Phase 8) and provides better DX for SPA deployment.
- **Full `.sppkg` packaging in Phase 9** — Rejected per ADR-0007; TypeScript version conflicts remain unresolved.
- **Hard-code mock auth for Vercel** — Rejected; env var approach is more flexible and avoids code divergence between environments.
