# 01 — B02 Repo-Truth Implementation Plan

## Objective

Implement the B02 runtime/deployment foundation for **HB Intel My Dashboard** against the current HB Intel monorepo while preserving the existing architecture patterns established by Project Control Center, HB Homepage, Estimating, Accounting, and the SPFx package orchestrator.

---

## Repo-truth findings that govern implementation

### 1. The B02 planning artifact exists, but the My Dashboard runtime app does not

Live repo truth shows the My Dashboard B01/B02 planning documents and comprehensive outline in the target `dev-plan` folder, but does not show a runtime `apps/my-dashboard` domain or a My Dashboard package/manifest/runtime marker.

**Implementation consequence:** B02 must create runtime code, not merely update docs.

### 2. `pnpm-workspace.yaml` already includes `apps/*`

Adding `apps/my-dashboard` should automatically enter the workspace. A custom workspace path update should not be necessary.

**Implementation consequence:** avoid unnecessary workspace-file edits unless live repo truth changed before execution.

### 3. SPFx standalone-package posture already exists

PCC and HB Homepage establish the exact manifest/package shape My Dashboard should follow:

- package solution JSON under `apps/<domain>/config/`,
- web-part manifest under `apps/<domain>/src/webparts/<webpart>/`,
- `supportsFullBleed: true`,
- SharePoint-only host for these communication-site dashboard shells,
- toolbox-visible entry,
- separate package solution with aligned solution/feature/manifest versions.

**Implementation consequence:** clone the pattern structurally, not blindly. Generate new My Dashboard GUIDs.

### 4. Protected API permission posture already exists

Estimating and Accounting request:

```json
{
  "resource": "hb-intel-api-production",
  "scope": "access_as_user"
}
```

**Implementation consequence:** My Dashboard package solution should use the same permission request unless the repo has been deliberately re-architected before execution.

### 5. Runtime config and production-readiness primitives already exist

Estimating and Accounting use runtime injection plus Vite env fallback for:

- `functionAppUrl`,
- `backendMode`,
- `allowBackendModeSwitch`,
- `apiAudience`,
- production readiness assessment.

**Implementation consequence:** My Dashboard should adapt this pattern, not invent a new `MY_DASHBOARD_*` public bundle config namespace.

### 6. SPFx token-provider bootstrap already exists

Estimating `mount.tsx` proves the desired mount-level flow:

1. store runtime config,
2. resolve SPFx permissions,
3. bootstrap auth,
4. resolve API audience,
5. create `getApiToken` via `createSpfxApiTokenProvider(...)`,
6. pass that capability into the React app/provider layer.

**Implementation consequence:** My Dashboard should follow this token-provider path and avoid token persistence or direct backend calls in mount.

### 7. Runtime marker/proof path exists in PCC

PCC `mount.tsx` exposes:

```ts
{ mount, unmount, runtimeMarkerId }
```

and the packaging orchestrator tracks the corresponding web-part ID in `RUNTIME_MARKERS_BY_DOMAIN`.

**Implementation consequence:** My Dashboard must expose its web-part GUID as `runtimeMarkerId`, and the orchestrator must assert it.

### 8. `tools/build-spfx-package.ts` is the authoritative packager

The orchestrator already supports:

- single-domain package models,
- fresh-build requirements,
- domain-specific runtime markers,
- critical-runtime file fingerprints,
- package-truth proof generation.

**Implementation consequence:** My Dashboard must be added as a first-class domain there. Do not create a second packaging script.

---

## Closed implementation posture

### App/package identity

Recommended initial posture for a new My Dashboard package:

| Field | Target |
|---|---|
| npm package name | `@hbc/spfx-my-dashboard` |
| package solution name | `hb-intel-my-dashboard` |
| .sppkg | `hb-intel-my-dashboard.sppkg` |
| web-part alias | `MyDashboardWebPart` |
| toolbox title | `HB Intel My Dashboard` |
| initial package/feature/manifest version | `1.0.0.0` |

If a live repo version-governance document appears before execution and explicitly prescribes a different initial My Dashboard version, follow repo truth and document the variance.

### GUID posture

Generate once and reuse consistently:

- solution GUID,
- feature GUID,
- web-part manifest GUID.

The web-part GUID must also be used as the My Dashboard runtime marker ID in `mount.tsx` and `tools/build-spfx-package.ts`.

### Runtime config posture

Use the B02 hybrid interpretation:

- public deployment mode: `production | ui-review`,
- internal future read-model transport: `backend | fixture` in later batches,
- B02 implements only the deployment/runtime primitives, not downstream read-model clients.

### Auth posture

- token provider created in `mount.tsx`,
- tokens never stored,
- token provider capability passed downward,
- no protected route calls in mount,
- no direct Adobe API calls in frontend,
- no property-pane auth/runtime secrets.

---

## Prompt-by-prompt implementation plan

### Prompt 01 — Create app/domain and SPFx package identity
Create the new `apps/my-dashboard` package scaffold:

- `package.json`,
- `tsconfig.json`,
- `vite.config.ts`,
- `README.md`,
- `config/package-solution.json`,
- `src/webparts/myDashboard/MyDashboardWebPart.manifest.json`.

Use PCC/HB Homepage as structural precedents. Do not implement shell UI.

### Prompt 02 — Implement runtime config and readiness
Create:

- `src/config/runtimeConfig.ts`,
- `src/config/productionReadiness.ts` if the agent concludes a split module best matches the B02 plan; otherwise preserve an equivalent split through exports with clear rationale.

The files must expose My Dashboard-specific runtime types/functions, modeled on Estimating/Accounting, and remain browser-safe.

### Prompt 03 — Implement mount/auth bootstrap/runtime marker
Create:

- `src/MyDashboardApp.tsx`,
- `src/mount.tsx`.

Wire:

- runtime config injection,
- SPFx auth bootstrap,
- API audience resolution,
- token-provider creation,
- global `__hbIntel_myDashboard`,
- `runtimeMarkerId`.

The rendered app should be a deliberately minimal runtime host, not a fake My Work product UI.

### Prompt 04 — Register packaging orchestrator and proof contract
Update `tools/build-spfx-package.ts` with:

- domain registry entry,
- My Dashboard web-part ID constant,
- `MY_DASHBOARD_CRITICAL_RUNTIME_PATHS`,
- `CRITICAL_RUNTIME_PATHS_BY_DOMAIN['my-dashboard']`,
- `RUNTIME_MARKERS_BY_DOMAIN['my-dashboard']`.

Ensure the packager can resolve the new app correctly.

### Prompt 05 — Validate and close out
Run:

- type checks,
- app build,
- tests where available,
- orchestrator package build if Node 18/SPFx toolchain is available,
- grep/inspection validation for forbidden scope drift.

Produce a grounded closeout.

---

## Explicitly deferred work

The following should not appear in B02 implementation commits:

- `packages/models/src/myWork/...`,
- `backend/functions/src/hosts/my-work-read-model/...`,
- Adobe provider clients,
- queue UI/cards,
- shell navigation or dashboard choreography,
- hosted Playwright tests,
- SharePoint page deployment assets/screenshots.

Later batches own those concerns.
