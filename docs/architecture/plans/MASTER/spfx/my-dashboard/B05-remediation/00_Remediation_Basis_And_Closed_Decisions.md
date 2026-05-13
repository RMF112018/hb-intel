# Remediation Basis and Closed Decisions

## Audit Finding Summary

The current My Dashboard read-only/non-ready production render is explained by **implementation wiring gaps**, not by SharePoint user authentication failure.

### Confirmed repo-truth issues from the audit

1. `MyWorkHomeSurface` defaults to `readinessVariant = 'non-ready'`.
2. `AdobeSignActionQueueModuleSurface` defaults to `readinessVariant = 'non-ready'`.
3. `MyWorkSurfaceRouter` renders both surfaces without passing any readiness variant derived from backend state.
4. `MyWorkShell` receives `spfxContext` and `getApiToken`, but intentionally renames them `_spfxContext` / `_getApiToken` and does not consume them.
5. The backend read-model client/factory exists, but production React runtime does not create it, hold it, or invoke it to drive surfaces.
6. Cards currently rendered on home and Adobe surfaces use static copy / dashes / pending-source language rather than props backed by read-model data.
7. `readOnly: true` on `MyWorkReadModelEnvelope<T>` is a designed contract invariant, not a user-authentication status.
8. The packaging chain can emit a My Dashboard `.sppkg` without usable backend runtime markers if required environment variables are not injected, because the shell DefinePlugin receives empty strings.
9. The uploaded `.sppkg` observed during audit appeared to differ from the then-current repo source/version; parity must be proven before deeper fixes proceed.

## Files and Seams That Matter Most

### App mount/runtime
- `apps/my-dashboard/src/mount.tsx`
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/config/runtimeConfig.ts`
- `apps/my-dashboard/src/config/productionReadiness.ts`

### Shell/router/surface wiring
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx`

### Read-model client
- `apps/my-dashboard/src/api/myWorkReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts`
- `apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts`

### Static cards to convert
- `apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx`
- `apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx`

### Backend route truth
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts`

### Packaging truth
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`

## Target Architecture

### Runtime bootstrapping

The app root should receive:
- `spfxContext`
- `getApiToken`

and compose:
- a My Work read-model client using `createMyWorkReadModelClient(...)`,
- production/backend mode when runtime config is valid,
- fixture/backend-unavailable fallback when runtime config or token readiness is absent.

### Data ownership

At minimum:
- Home surface reads `getMyWorkHome()`.
- Adobe Sign focused module reads `getAdobeSignActionQueue(...)`.
- Project links flow can remain on its existing implementation path if outside the immediate visual defect, but do not break it.

### Readiness derivation

UI readiness must be derived from read-model envelopes, for example:
- `sourceStatus === 'available'` or controlled `partial` state can render ready/live presentation,
- `configuration-required`, `authorization-required`, `principal-unresolved`, `source-unavailable`, or `backend-unavailable` render typed non-ready guidance.

Do not collapse these statuses into one generic error state.

### Card rendering

Cards must become prop-driven:
- counts,
- generated timestamps,
- source-readiness states,
- preview queue rows,
- focused action-list rows,
- CTA state.

Hardcoded copy remains permissible only for explanatory labels and empty-state guidance, not for data values that already exist in the envelope.

### Packaging

A production My Dashboard package must not silently ship with absent backend runtime config. The packaging toolchain should detect this and either:
- fail fast for production package generation, or
- emit a strong explicit proof/diagnostic that the artifact is intentionally non-production.

The recommended closure is fail-fast for production-mode My Dashboard packaging when required runtime config is absent.

## Non-Negotiable Safety Rules

- No secrets in browser bundle.
- No Adobe OAuth code/token material in frontend.
- No direct SPFx → Adobe API calls.
- No browser-side actor override.
- No modification to backend route paths without a separate architecture decision.
- No weakening backend failure semantics to mask configuration gaps.
