# Project Setup Requests — Host Behavior Validation

> **Date**: 2026-03-30
> **Scope**: Validate and harden light-mode enforcement, TeamsPersonalApp support, and PWA migration compatibility
> **Surface**: `apps/estimating/` (Project Setup Requests SPFx)

---

## 1. Light-Mode Enforcement — Validated

Three-layer governance confirmed durable and correctly scoped:

| Layer | Mechanism | Status |
|-------|-----------|--------|
| **React provider** | `HbcThemeProvider(forceTheme='light')` in App.tsx when `spfxContext` provided | Correct — all SPFx and Teams hosts get light theme |
| **Compile-time tokens** | Griffel styles reference `HBC_SURFACE_LIGHT` compile-time values | Correct — zero hardcoded hex in pages or components |
| **SPFx manifest** | `supportsThemeVariants: false` | **Fixed** — was `true`, now `false` |

### Fix applied: `supportsThemeVariants: false`

The manifest previously declared `"supportsThemeVariants": true` which tells SharePoint/Teams to inject section theme variants into the webpart DOM. Since the app permanently forces light mode, this was contradictory — a page author could place the webpart in a dark-themed section and get conflicting backgrounds. Setting to `false` prevents the host from injecting theme variants.

### Dev mode behavior (intentional)

When `spfxContext` is undefined (Vite dev server), `forceTheme` is not set. This allows developers to test with OS dark mode during development. This is correct and intentional — it does not affect production.

## 2. TeamsPersonalApp Support — Validated

| Check | Result |
|-------|--------|
| `supportedHosts` includes `TeamsPersonalApp` | Yes — manifest line 10 |
| `supportedHosts` includes `SharePointWebPart` | Yes — manifest line 9 |
| Light-mode forcing works in Teams context | Yes — Teams host provides `spfxContext`, triggering `forceTheme='light'` |
| Layout uses fixed widths | No — all pages use fluid/responsive layout |
| Fixed viewport height assumptions | No — removed `height="600px"` from data table in prior prompt |
| Shell header works in both hosts | Yes — simplified shell with optional "Back to Project Hub" |

### Remaining risk: `showBackToProjectHub` in Teams

The `resolveProjectHubUrl()` returns a relative SharePoint path (`/sites/project-hub`) in SPFx mode. In TeamsPersonalApp, this relative URL may not resolve correctly because the Teams iframe base URL differs from SharePoint. This is a pre-existing behavior in `@hbc/shell` — not introduced by this work. Recommended follow-up: make `resolveProjectHubUrl` host-aware.

## 3. PWA Migration Compatibility — Validated

| Check | Result |
|-------|--------|
| `mount()` accepts optional `spfxContext` | Yes — PWA can call `mount(el)` without SPFx context |
| `App` component accepts optional `spfxContext` | Yes — when undefined, theme follows OS preference |
| No SPFx-only runtime dependencies in React tree | Correct — `@hbc/auth/spfx` only imported in mount.tsx and TeamStepBody (conditional) |
| Router uses memory history (portable) | Yes — `createMemoryHistory()` in router factory |
| State management is portable | Yes — Zustand stores, React Query, controlled forms |
| Graph people search adapter is pluggable | Yes — `useGraphPeopleSearch(getAccessToken)` accepts any async token provider |

### Architecture seam for PWA migration

The mount/unmount API (`mount(el, spfxContext?, config?)`) is the clean seam. A PWA integration would:
1. Call `mount(el)` without SPFx context
2. Provide its own auth bootstrap (MSAL instead of SPFx RBAC)
3. Theme follows OS preference (no `forceTheme`)
4. Graph token provider uses MSAL `acquireTokenSilent()` instead of `aadTokenProviderFactory`

No dead-end decisions were identified that would block this migration.

## 4. Root-Route Fix: Typography Token Correction

Fixed font-size declarations in `root-route.tsx` that derived pixel values from spacing tokens:

| Before | After |
|--------|-------|
| `fontSize: ${HBC_SPACE_SM + HBC_SPACE_XS}px` (12px from 8+4) | `fontSize: bodySmall.fontSize` (0.75rem) |
| `fontSize: ${HBC_SPACE_SM}px` (8px) | `fontSize: labelType.fontSize` (0.75rem) |

Spacing tokens are for layout gaps/padding; typography tokens are for font sizes. Using the correct token category improves semantic clarity and ensures font sizes scale with the type system.

## 5. Test Coverage Added

New file: `apps/estimating/src/test/hostBehavior.test.ts` — 5 tests:

1. **Light-mode: App.tsx forces light theme when spfxContext is provided** — validates the forceTheme pattern exists in source
2. **Light-mode: manifest declares supportsThemeVariants=false** — reads and validates the JSON manifest
3. **Teams: manifest includes TeamsPersonalApp in supportedHosts** — validates both host declarations
4. **PWA: mount.tsx accepts optional spfxContext** — validates the migration seam
5. **PWA: App component accepts optional spfxContext** — validates the component interface

These tests are static/structural validations that will catch accidental regressions in host posture.

## 6. Files Changed

| File | Change |
|------|--------|
| `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json` | `supportsThemeVariants: false` |
| `apps/estimating/src/router/root-route.tsx` | Typography tokens instead of spacing-derived font sizes |
| `apps/estimating/src/test/hostBehavior.test.ts` | **New** — 5 host-behavior validation tests |
| `apps/estimating/package.json` | Version bump 0.2.4 → 0.2.5 |

## 7. Verification

| Check | Result |
|-------|--------|
| Build | Pass (1,185.01 KB, gzip 337.99 KB) |
| Lint | 0 errors (61 pre-existing warnings) |
| Tests | 112/112 pass + 2 todo (17 files) |

## 8. Remaining Risks

1. **`resolveProjectHubUrl` in Teams** — returns SharePoint-relative path that may not work in Teams iframe. Pre-existing `@hbc/shell` behavior. Fix should be host-aware URL resolution in the shell utility.
2. **Graph API permission** — `User.Read.All` must be approved in SharePoint admin center for the people picker to function. Not a code issue — deployment configuration.
3. **Teams app manifest** — if the Teams app was distributed via `.zip` manifest package, the title "Project Setup Requests" must be updated there too. This is outside the SPFx manifest scope.
