# Latent `/api/users/me/*` Dependency Gap Validation — Project Setup

## Executive Summary

**Verdict: Confirmed isolated — the endpoint strings are present in the IIFE bundle due to format constraints, but the static import chain has been broken and the endpoints are NOT reachable under Project Setup runtime wiring.**

The estimating app mounts `<ComplexityProvider spfxContext={spfxContext}>` without passing `enableApiSync={true}`. The `ComplexityProvider` defaults `enableApiSync` to `false`, and the entire API sync code path (which calls `/api/users/me/preferences` and `/api/users/me/groups`) is gated behind `if (_testPreference || !enableApiSync) return;`. Under current wiring, zero network requests to these endpoints occur at runtime.

**P9 remediation (2026-04-01):** The static import of `complexityApiClient.ts` in `ComplexityProvider.tsx` has been converted to a dynamic import (`import()`) inside the gated code paths. The API client module is only loaded when `enableApiSync=true`. The endpoint strings remain in the IIFE bundle because `inlineDynamicImports: true` resolves all dynamic imports at build time — this is an accepted constraint of the SPFx single-file format. See `Frontend-Same-Origin-Dependency-Reconciliation.md` for the full audit.

The prior remediation reports (Phase 7, Phase 8) are accurate: they correctly identify these endpoints as "dead dependencies for PS scope" with "zero network requests to `/api/users/me/*` in production Project Setup."

---

## 1. Prior Remediation-Report Claims

### Phase 8 report — P8-03: dead dependency confirmed

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

> Lines 285-286:
> | `/api/users/me/preferences` | ... | NO — `enableApiSync` defaults to `false`; estimating app does not pass `enableApiSync={true}` | NO — no route in Project Setup domain host | Dead dependency for PS scope |
> | `/api/users/me/groups` | ... | NO — same `enableApiSync` gate | NO — no route in Project Setup domain host | Dead dependency for PS scope |

> Line 291: "The `/api/users/me/*` endpoints are not active dependencies for the Project Setup release surface"

> Line 334: "The `/api/users/me/*` endpoints are confirmed dead for this scope (opt-in disabled, no backend implementation, graceful degradation)."

### Phase 7 report — P7-03: formally resolved as out of scope

**File:** `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

> Lines 450-451:
> | `/api/users/me/preferences` | **Not in Project Setup scope** | Only in `packages/complexity/src/storage/complexityApiClient.ts`; API sync opt-in disabled by default (P6-03); estimating app does not activate it |
> | `/api/users/me/groups` | **Not in Project Setup scope** | Same file; same opt-in gate; no backend handler exists |

> Line 454: "P6-03 formally resolved the complexity preferences mismatch by making `enableApiSync` opt-in with `false` as default. The estimating app's `<ComplexityProvider>` in `App.tsx` does not pass `enableApiSync={true}`. Zero network requests to `/api/users/me/*` occur in production Project Setup."

### Phase 1-5 gap report — P6-03 resolution

**File:** `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

> Line 1971: "The `ComplexityProvider` API sync is now opt-in (`enableApiSync` prop, default `false`). When disabled (the default for all current consumers), the provider uses localStorage/sessionStorage only and makes zero network requests to `/api/users/me/preferences`. The API client code is retained for future use when a preferences backend is deployed."

**Confirmed: Reports describe runtime unreachability, not source-code removal or packaging exclusion. The claims are scoped to "zero network requests" and "dead dependency for PS scope."**

---

## 2. Estimating App Wiring Evidence

### 2.1 `ComplexityProvider` is mounted — without `enableApiSync`

**File:** `apps/estimating/src/App.tsx` (lines 47-53)

```tsx
<ComplexityProvider spfxContext={spfxContext}>
  <SessionStateProvider executor={projectSetupSessionExecutor}>
    <ProjectSetupBackendProvider getApiToken={getApiToken}>
      <AppRouter />
    </ProjectSetupBackendProvider>
  </SessionStateProvider>
</ComplexityProvider>
```

**Confirmed repo fact:** `ComplexityProvider` IS mounted in the Project Setup app tree. It receives `spfxContext` but does NOT receive `enableApiSync={true}`. The prop defaults to `false`.

### 2.2 Complexity UI components are actively used

Multiple Project Setup pages and components use `HbcComplexityGate` and `HbcComplexityDial` for tier-based UI gating (W0-G4-T06). These components consume the `ComplexityContext` provided by `ComplexityProvider` and depend on the tier value stored in localStorage/sessionStorage.

**Confirmed repo fact:** The complexity package is an active UI dependency for the Project Setup surface. The provider is required for these components to function.

---

## 3. `ComplexityProvider` / API-Helper Evidence

### 3.1 `enableApiSync` gate is the critical control

**File:** `packages/complexity/src/context/ComplexityProvider.tsx` (line 54)

```typescript
enableApiSync = false,
```

**File:** `packages/complexity/src/context/ComplexityProvider.tsx` (line 70)

```typescript
if (_testPreference || !enableApiSync) return; // Skip when test mode or API sync disabled
```

When `enableApiSync` is `false` (the default), the `useEffect` at line 69 returns immediately. The entire API sync code path — `fetchPreference()`, `deriveInitialTierFromADGroups()`, `patchPreference()` — is unreachable.

**File:** `packages/complexity/src/context/ComplexityProvider.tsx` (lines 182, 189)

```typescript
if (enableApiSync) void patchPreference(updated); // Fire-and-forget when API sync enabled
```

The `setTier` and `setShowCoaching` callbacks also guard `patchPreference()` behind `enableApiSync`.

**Confirmed repo fact:** All 4 code paths that call API helpers are gated behind `enableApiSync`. When `false`, zero API calls occur.

### 3.2 API helper imports are unconditional

**File:** `packages/complexity/src/context/ComplexityProvider.tsx` (lines 15-18)

```typescript
import {
  fetchPreference,
  patchPreference,
  deriveInitialTierFromADGroups,
} from '../storage/complexityApiClient';
```

These imports are static (not dynamic/lazy). The API client module is imported regardless of whether `enableApiSync` is true. This means the module's constants (`PREFERENCES_ENDPOINT`, `AD_GROUPS_ENDPOINT`) are evaluated and the functions are defined, but they are never called under current wiring.

**Confirmed repo fact:** The API client module is imported unconditionally but never executed.

### 3.3 API client endpoint strings

**File:** `packages/complexity/src/storage/complexityApiClient.ts` (lines 5-6)

```typescript
const PREFERENCES_ENDPOINT = '/api/users/me/preferences';
const AD_GROUPS_ENDPOINT = '/api/users/me/groups';
```

**Confirmed repo fact:** The endpoint strings exist in source and are evaluated at import time.

---

## 4. Packaged-Artifact Evidence

### 4.1 Endpoint strings ARE in the shipped bundle

**File:** `tools/spfx-shell/release/assets/estimating-app-f72eb6c7.js`

```
"/api/users/me/preferences"
"/api/users/me/groups"
```

Both endpoint strings appear in the compiled IIFE bundle. The Vite bundler includes them because `complexityApiClient.ts` is statically imported by `ComplexityProvider.tsx`, which is a live dependency.

### 4.2 `enableApiSync` defaults to `false` in the compiled bundle

```
enableApiSync:r=!1
```

The default value `false` (`!1`) is compiled into the bundle. No call site in the estimating app overrides this.

**Confirmed packaged-artifact fact:** The endpoint strings are present in the shipped bundle, but the runtime gate (`enableApiSync=false`) prevents execution.

---

## 5. Runtime-Reachability Analysis

### 5.1 Under current Project Setup wiring

| Code Path | Reachable? | Why |
|-----------|-----------|-----|
| `fetchPreference()` → `GET /api/users/me/preferences` | **No** | Gated behind `enableApiSync` (line 70), which is `false` |
| `patchPreference()` → `PATCH /api/users/me/preferences` | **No** | Gated behind `enableApiSync` (lines 182, 189) |
| `deriveInitialTierFromADGroups()` → `GET /api/users/me/groups` | **No** | Called only inside `syncFromApi()` which is gated behind `enableApiSync` (line 70) |

### 5.2 Under what conditions would they become reachable?

These paths would become reachable if:
1. A future code change passes `enableApiSync={true}` to `<ComplexityProvider>` in `App.tsx`
2. A future consumer of `@hbc/complexity` enables API sync in a different app surface

Neither condition exists in the current repo. No code path in the estimating app or any other app currently passes `enableApiSync={true}`.

### 5.3 What happens if they were called?

If `enableApiSync` were set to `true`:
- `fetchPreference()` would make a `GET /api/users/me/preferences` request with `credentials: 'include'` (cookie-based auth, not Bearer token)
- No backend route handles this endpoint in the Project Setup domain host
- The request would fail (404 or network error)
- `ComplexityProvider` would catch the error silently (line 107-112) and fall back to cached/optimistic preference
- The app would continue functioning with no visible failure

---

## 6. Verdict

**Partially confirmed — the dependency exists in source and bundle but is not reachable under current runtime wiring.**

| Dimension | Status |
|-----------|--------|
| Endpoint strings in source | **Yes** — `complexityApiClient.ts` lines 5-6 |
| Endpoint strings in bundle | **Yes** — present in `estimating-app-f72eb6c7.js` |
| `ComplexityProvider` mounted | **Yes** — `App.tsx` line 47 |
| `enableApiSync` passed as `true` | **No** — not passed; defaults to `false` |
| API calls reachable at runtime | **No** — all 4 code paths gated behind `enableApiSync` |
| Backend routes exist | **No** — no `/api/users/me/*` routes in PS domain host |
| Prior report claims accurate | **Yes** — reports claim "dead dependency" and "zero network requests," which is correct for current wiring |
| Bundle hygiene concern | **Yes** — dead code is shipped in the production bundle |

---

## 7. Why the Verdict Is Correct

1. **The `enableApiSync` gate is absolute.** Line 70 of `ComplexityProvider.tsx` returns from the `useEffect` immediately when `enableApiSync` is `false`. Lines 182 and 189 guard the fire-and-forget `patchPreference()` calls. There is no alternate code path that bypasses this gate.

2. **The estimating app does not enable API sync.** `App.tsx` line 47 mounts `<ComplexityProvider spfxContext={spfxContext}>` without `enableApiSync`. TypeScript default parameter (line 54) sets it to `false`.

3. **The test suite explicitly asserts this.** `authTransportContract.test.ts` (lines 85-91) and `routeParityContract.test.ts` (lines 49-58) both assert that `ComplexityProvider` does not force API sync and that the estimating app does not pass `enableApiSync={true}`.

4. **The prior reports are accurately scoped.** They claim "dead dependency for PS scope" and "zero network requests" — not "removed from source" or "excluded from bundle." The distinction between runtime reachability and bundle presence is maintained in the report language.

5. **The bundle presence is expected.** Vite bundles all static imports. Since `ComplexityProvider.tsx` imports `complexityApiClient.ts` at the module level (not behind a dynamic `import()`), the endpoint strings are included in the bundle regardless of whether they are called. This is standard bundler behavior, not a packaging defect.

---

## 8. Remediation Targets

The following changes would address the latent dependency. **Not implemented in this validation.**

### 8.1 Convert API client import to dynamic import (bundle exclusion)

Change `ComplexityProvider.tsx` to use dynamic `import()` for the API client, only loaded when `enableApiSync` is `true`:

```typescript
// Before (static import — always bundled):
import { fetchPreference, patchPreference, deriveInitialTierFromADGroups } from '../storage/complexityApiClient';

// After (dynamic import — only loaded when needed):
// Inside useEffect:
if (!enableApiSync) return;
const { fetchPreference, deriveInitialTierFromADGroups } = await import('../storage/complexityApiClient');
```

This would tree-shake the API client out of the bundle when no consumer enables API sync. The endpoint strings would no longer appear in the shipped bundle.

**Trade-off:** Adds async loading complexity to the provider. The current approach is simpler and the dead code is harmless at ~2KB.

### 8.2 Add regression test for bundle exclusion

If the dynamic import approach is adopted, add a test that verifies the estimating app's built bundle does NOT contain `/api/users/me/` strings.

### 8.3 Accept current state (no change)

The current implementation is defensible:
- The dead code is inert and adds negligible bundle size
- The `enableApiSync` gate is tested and enforced
- The prior reports accurately describe the runtime posture
- No production behavior is affected

---

## 9. Unresolved Questions

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | Should the complexity package use dynamic imports for the API client? | Would eliminate the endpoint strings from the bundle entirely, but adds complexity for ~2KB savings |
| 2 | Will any future HB Intel surface enable `enableApiSync`? | If yes, the API client and backend routes will need to be built. If no, the client code could be removed entirely |
| 3 | Should the `credentials: 'include'` auth model in the API client be updated to Bearer token auth? | The current API client uses cookie-based auth, which is incompatible with the Project Setup Bearer-token model. If API sync is ever enabled, this would need to change |

---

## Appendix: Evidence Index

| Evidence | Source | Type |
|----------|--------|------|
| `ComplexityProvider` mounted without `enableApiSync` | `apps/estimating/src/App.tsx` line 47 | Confirmed repo fact |
| `enableApiSync` defaults to `false` | `packages/complexity/src/context/ComplexityProvider.tsx` line 54 | Confirmed repo fact |
| API sync gated behind `enableApiSync` | `packages/complexity/src/context/ComplexityProvider.tsx` line 70 | Confirmed repo fact |
| `patchPreference` gated behind `enableApiSync` | `packages/complexity/src/context/ComplexityProvider.tsx` lines 182, 189 | Confirmed repo fact |
| `/api/users/me/preferences` endpoint string | `packages/complexity/src/storage/complexityApiClient.ts` line 5 | Confirmed repo fact |
| `/api/users/me/groups` endpoint string | `packages/complexity/src/storage/complexityApiClient.ts` line 6 | Confirmed repo fact |
| Endpoint strings in compiled bundle | `tools/spfx-shell/release/assets/estimating-app-f72eb6c7.js` | Confirmed packaged-artifact fact |
| `enableApiSync:r=!1` in compiled bundle | `tools/spfx-shell/release/assets/estimating-app-f72eb6c7.js` | Confirmed packaged-artifact fact |
| Test: ComplexityProvider does not force API sync | `apps/estimating/src/test/authTransportContract.test.ts` lines 85-91 | Confirmed repo fact |
| Test: ComplexityProvider defaults to API sync disabled | `apps/estimating/src/test/routeParityContract.test.ts` lines 49-58 | Confirmed repo fact |
| P8-03: dead dependency for PS scope | Phase 8 report lines 285-286 | Prior report claim (validated) |
| P7-03: zero network requests to `/api/users/me/*` | Phase 7 report line 454 | Prior report claim (validated) |
| P6-03: API sync opt-in disabled by default | Phase 1-5 report line 1971 | Prior report claim (validated) |
