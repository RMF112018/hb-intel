# Estimating SPFx Limited-Release Acceptance Audit

**Date:** 2026-03-30
**Scope:** Final acceptance audit for the Estimating SPFx limited-release SharePoint package.
**Package:** `dist/sppkg/hb-intel-estimating.sppkg`

## Verdict

The Estimating SPFx package is ready for SharePoint UI vetting in `ui-review` mode.

This verdict is based on code inspection, test coverage, a fresh package rebuild through the SPFx shell, and direct inspection of the generated `.sppkg` contents.

## Confirmed Facts

### 1. Limited-release posture is Project Setup only

- `apps/estimating/src/router/routes.ts` redirects `/` to `/project-setup` and registers only:
  - `/project-setup`
  - `/project-setup/new`
  - `/project-setup/$requestId`
- `apps/estimating/src/router/root-route.tsx` exposes a single tool-picker item: `Project Setup`.
- Bids and Templates pages still exist in source, but they are not registered in the limited-release route table and are not surfaced in the shell navigation.

### 2. UI Review mode uses localStorage-backed mock data

- `apps/estimating/src/project-setup/backend/uiReviewProjectSetupClient.ts` stores data under:
  - `hb-intel:estimating:ui-review:project-setup:requests`
  - `hb-intel:estimating:ui-review:project-setup:statuses`
- The mock client seeds realistic initial request and provisioning-status records on first read or corrupted storage recovery.
- The mock client supports:
  - list requests
  - get provisioning status
  - create request
  - retry provisioning
  - escalate provisioning

### 3. UI Review mode does not fall through to the live backend path

- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` creates the local mock client whenever `backendMode === 'ui-review'`.
- The same provider only calls `createProvisioningApiClient(...)` in `production` mode.
- `apps/estimating/src/pages/RequestDetailPage.tsx` disables SignalR negotiation and 30-second polling when `isUiReview` is true.
- `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` verifies:
  - root banner renders in `ui-review`
  - seeded requests render without creating the live provisioning client
  - new requests persist to localStorage
  - detail rendering suppresses live SignalR behavior
  - retry mutates the stored mock request state
  - switching to `ui-review` does not navigate away from the current Project Setup route

### 4. Production mode still uses the live provisioning client path

- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` resolves `functionAppUrl` and constructs the live provisioning adapter only when the effective mode is `production`.
- `apps/estimating/src/config/runtimeConfig.ts` still requires a configured Function App URL for production mode and intentionally skips that requirement in `ui-review`.
- `apps/estimating/src/test/ProjectSetupUiReviewMode.test.tsx` verifies switching back to `Production` calls `createProvisioningApiClient(...)`.

### 5. Mode switching exists and is intentionally gated

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` injects:
  - `backendMode`
  - `functionAppUrl`
  - `allowBackendModeSwitch`
- `apps/estimating/src/router/root-route.tsx` renders a reviewer-only header control with explicit `UI Review` and `Production` buttons when `allowBackendModeSwitch` is enabled.
- `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` persists the tester override in:
  - `hb-intel:estimating:project-setup:backend-mode-override`
- The selected mode is applied without route churn and resets provisioning client state before re-render.

### 6. UI Review mode does not show an intentional backend failure as a red outage panel

- `apps/estimating/src/router/root-route.tsx` shows an informational banner in `ui-review`:
  - `UI Review mode is active. Backend connections are disabled, and Project Setup is using local sample data saved in this browser.`
- `apps/estimating/src/pages/RequestDetailPage.tsx` suppresses live-connection warning banners in `ui-review`.
- `apps/estimating/src/pages/ProjectSetupPage.tsx` loads mock records through the local client in `ui-review`, so the page does not enter the backend-failure path solely because backend access is intentionally disabled.

### 7. SharePoint displayed app version is `0.0.0.1`

- `apps/estimating/config/package-solution.json` sets:
  - `solution.version = 0.0.0.1`
  - `solution.features[0].version = 0.0.0.1`
- Fresh artifact inspection confirms:
  - `dist/sppkg/hb-intel-estimating.sppkg` `AppManifest.xml` contains `Version="0.0.0.1"`
  - `dist/sppkg/hb-intel-estimating.sppkg` `feature_cb3b1520-1665-4412-83ab-344c2182a2fd.xml` contains `Version="0.0.0.1"`
- `ClientSideAssets.xml` remains `1.0.0.0`, which is expected SPFx-generated internal feature metadata and not the App Catalog display version.

### 8. Packaging remains valid for SharePoint upload

- The Estimating app verification suite passed:
  - `pnpm --filter @hbc/spfx-estimating exec tsc --noEmit`
  - `pnpm --filter @hbc/spfx-estimating lint`
  - `pnpm --filter @hbc/spfx-estimating build`
  - `pnpm --filter @hbc/spfx-estimating test`
- A fresh SharePoint package was rebuilt through the SPFx shell under Node 18 using:
  - `gulp bundle --ship`
  - `gulp package-solution --ship`
- The resulting package was copied back to `dist/sppkg/hb-intel-estimating.sppkg` and re-inspected successfully.

## Inferences

- The package is appropriate for reviewer-driven SharePoint UI walkthroughs because the limited-release surface is constrained to Project Setup, review mode avoids backend dependencies, and the generated package metadata is aligned with the requested App Catalog version.

## Non-Blocking Residual Issues

- `pnpm --filter @hbc/spfx-estimating lint` still reports pre-existing warnings, primarily inline-style warnings and test typing warnings, but no errors.
- `pnpm --filter @hbc/spfx-estimating test` still emits pre-existing React `act(...)` and DOM nesting warnings in some tests, but all tests pass.
- `tools/build-spfx-package.ts` can hit a local Node handoff issue in this workstation environment when it shells into `nvm use 18`; the underlying SPFx shell packaging flow still succeeds and produces a valid `.sppkg`. This is a local tooling caveat, not a blocker for SharePoint UI vetting of the generated package.

## Acceptance Decision

Ready for SharePoint UI vetting in `ui-review` mode.
