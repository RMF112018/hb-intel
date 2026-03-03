# Phase 9: Verification & Deployment Readiness — Developer Guide

## Overview

Phase 9 validates the entire HB Intel foundation (Phases 0–8) and prepares for production deployment. It expands end-to-end testing to cover the dev-harness and PWA navigation, configures Vercel SPA deployment for the PWA, and makes auth/adapter modes environment-configurable for zero-code-change deployment transitions.

## What Was Delivered

| Deliverable                         | Description                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| **Dev-harness preview fix**         | `--port 3000` added to preview script for consistent local testing                     |
| **Playwright multi-project config** | Separate `chromium` (PWA) and `dev-harness` test projects with independent web servers |
| **E2E: dev-harness tests**          | 13-tab navigation verification + DevControls theme toggle test                         |
| **E2E: PWA navigation tests**       | Root load + 5 MVP route tests + shell header verification                              |
| **Vercel SPA config**               | `vercel.json` with catch-all rewrite, immutable asset caching, service worker no-cache |
| **Env-configurable auth/adapter**   | `VITE_AUTH_MODE` and `VITE_ADAPTER_MODE` env vars with sensible defaults               |
| **ADR-0011**                        | Documents verification strategy, Vercel config, and migration kickoff decisions        |
| **Domain migration runbook**        | Per-domain checklist template for incremental legacy cutover                           |

## Running Verification Locally

```bash
# 1. Full monorepo build (21 tasks)
pnpm turbo run build

# 2. Format check
pnpm format:check

# 3. Type check
pnpm turbo run check-types

# 4. Run all E2E tests (both PWA and dev-harness projects)
pnpm e2e

# 5. Run only PWA tests
pnpm exec playwright test --project=chromium

# 6. Run only dev-harness tests
pnpm exec playwright test --project=dev-harness

# 7. Validate Vercel config
node -e "JSON.parse(require('fs').readFileSync('apps/pwa/vercel.json','utf8'));console.log('OK')"
```

## Vercel Deployment Setup

### Initial deployment (mock auth)

1. Create a Vercel project linked to the monorepo
2. Set the root directory to `apps/pwa`
3. Vercel will detect `vercel.json` and use `framework: null` (prevents Next.js auto-detection)
4. Set environment variables:
   - `VITE_AUTH_MODE=mock` — bypasses Azure AD for initial testing
   - `VITE_ADAPTER_MODE=mock` — uses mock data adapters
5. Deploy — the catch-all rewrite handles TanStack Router SPA routing

### Production deployment (MSAL auth)

When Azure AD is configured:

1. Update Vercel environment variables:
   - `VITE_AUTH_MODE=msal`
   - `VITE_ADAPTER_MODE=proxy`
2. Redeploy — no code changes needed

### Vercel configuration details

- **`framework: null`** — prevents Vercel from auto-detecting Next.js in the monorepo
- **Catch-all rewrite** — `/(.*) → /index.html` enables client-side routing
- **Asset caching** — `/assets/*` gets `immutable` cache headers (Vite hashes filenames)
- **Service worker** — `/sw.js` gets `no-cache` to ensure updates propagate

## SPFx Testing Workflow

Per ADR-0007, `.sppkg` packaging is deferred due to TypeScript version conflicts. SPFx webpart testing uses the **iframe embedding approach**:

1. Build any SPFx webpart with Vite: `pnpm --filter @hbc/spfx-<name> build`
2. Deploy the `dist/` output to a static host (Vercel, Azure Static Web Apps, etc.)
3. In SharePoint, add the **Embed** webpart to a page
4. Paste the deployed URL into the Embed webpart
5. Verify the webpart renders correctly within the SharePoint chrome

This approach validates rendering and data flow without requiring the full SPFx packaging toolchain.

## Next Steps

1. **Begin domain migration** — follow `docs/how-to/developer/domain-migration-runbook.md` starting with Accounting
2. **Add unit tests** — ramp toward 95% coverage per Blueprint §2h
3. **Configure Azure AD** — switch `VITE_AUTH_MODE` to `msal` when tenant is ready
4. **SPFx packaging** — build `.sppkg` pipeline when TypeScript conflicts are resolved
