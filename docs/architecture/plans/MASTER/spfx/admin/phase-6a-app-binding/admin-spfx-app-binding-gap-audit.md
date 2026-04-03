# Admin SPFx IT Control Center — App-Binding Gap Audit

**Prompt:** P6A-01 — App-Binding Gap Audit and Slice Definition  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Audit the live repo to determine what exists for managed-app binding / backend-setup configuration, identify gaps, and define the smallest forward-compatible implementation slice.

---

## 1. Purpose

Phase 6 delivered a complete install/bootstrap lane: setup wizard, preflight validation, 19-step orchestrator with checkpoint pausing, post-install verification, and durable run/audit/evidence support. However, the install flow does not yet publish or resolve the backend runtime binding values that managed SPFx apps need before making backend-dependent calls.

This audit answers three questions:

1. What does the repo already provide for app-binding today?
2. What is missing?
3. What is the smallest forward-compatible implementation slice that closes the gap?

---

## 2. Authority set actually used

### Phase docs
| Document | Purpose |
|----------|---------|
| `phase-06/Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md` | Phase 6 objectives and scope |
| `phase-06/admin-spfx-phase-6-prerequisite-audit.md` | Phase 6 repo-truth baseline |
| `phase-06/admin-spfx-install-bootstrap-architecture.md` | Install/bootstrap layer model |
| `phase-06/admin-spfx-install-contract-slice.md` | Phase 6 shared contract surface |
| `phase-06/admin-spfx-install-orchestrator.md` | Install orchestrator behavior |
| `phase-06/admin-spfx-setup-wizard-ux.md` | Setup wizard UX |
| `phase-06/admin-spfx-phase-6-final-reconciliation.md` | Phase 6 closure and residual items |
| `admin-spfx-it-control-center-end-state-plan.md` | End-state plan (version 01.000.000) |

### Live repo — target app runtime areas
| Path | Content verified |
|------|-----------------|
| `apps/accounting/src/config/runtimeConfig.ts` | `IRuntimeConfig` interface, resolution chain, production readiness checks |
| `apps/accounting/src/mount.tsx` | `IMountConfig` interface, shell-injected config, SPFx auth bootstrap |
| `apps/accounting/src/backend/AccountingBackendContext.tsx` | Token resolution, Function App URL resolution, API client creation |
| `apps/estimating/src/config/runtimeConfig.ts` | Identical `IRuntimeConfig` pattern, enhanced error messages |
| `apps/estimating/src/mount.tsx` | `IMountConfig` with `__hbIntel_projectSetup` global |
| `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx` | Mode switching, production readiness gating, fallback to ui-review |
| `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | Webpack DefinePlugin injection, runtime config construction, mount() call |
| `tools/build-spfx-package.ts` | Build-time env injection pipeline, domain registry |

### Live repo — admin/control-plane areas
| Path | Content verified |
|------|-----------------|
| `packages/models/src/admin-control-plane/IInstallBootstrap.ts` | Install step catalog types, step IDs, action keys |
| `packages/models/src/admin-control-plane/IAdminRun.ts` | Run envelope, step result, failure summary |
| `packages/models/src/admin-control-plane/IAdminApi.ts` | API DTOs including `IAdminConfigRequest`/`IAdminConfigResponse` |
| `packages/models/src/admin-control-plane/IAdminAudit.ts` | Audit event types, evidence references |
| `backend/functions/src/services/admin-control-plane/types.ts` | Service interfaces including stub `IAdminConfigService` |
| `backend/functions/src/services/admin-control-plane/install-orchestrator.ts` | `executeInstallRun()` — 19-step catalog, no binding publication |
| `backend/functions/src/services/admin-control-plane/stubs.ts` | `StubAdminConfigService` — returns empty config |
| `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | Service container — configService always stub |
| `backend/functions/src/functions/adminApi/index.ts` | 14 API endpoints — no binding endpoints |
| `backend/functions/src/services/table-storage-service.ts` | Azure Table operations — no binding tables |

---

## 3. Confirmed repo facts about target apps' runtime config expectations

### Shared binding shape (duplicated, not shared)

Both Accounting and Project Setup define an identical `IRuntimeConfig` interface:

| Field | Type | Required for production | Purpose |
|-------|------|------------------------|---------|
| `functionAppUrl` | `string` | Yes | Azure Function App base URL |
| `apiAudience` | `string` | Yes | API audience URI for SPFx token acquisition (`api://<client-id>`) |
| `backendMode` | `'production' \| 'ui-review'` | No (defaults to `'production'`) | Runtime mode selector |
| `allowBackendModeSwitch` | `boolean` | No (defaults to `false`) | Enables reviewer-only mode switching (Project Setup only) |

**Source:** `apps/accounting/src/config/runtimeConfig.ts:14-20`, `apps/estimating/src/config/runtimeConfig.ts:14-20`

### Resolution chain (both apps)

Priority order (highest to lowest):

1. **Runtime injection** — shell webpart calls `mount(el, spfxContext, config)` with values from webpack DefinePlugin constants
2. **Vite build-time env** — `VITE_FUNCTION_APP_URL`, `VITE_BACKEND_MODE`, `VITE_ALLOW_BACKEND_MODE_SWITCH`, `VITE_API_AUDIENCE`
3. **Defaults** — `backendMode: 'production'`, `allowBackendModeSwitch: false`

If production mode requires `functionAppUrl` and neither runtime injection nor Vite env provides it, the app throws `ConfigError`.

**Source:** `apps/accounting/src/config/runtimeConfig.ts:83-172`, `apps/estimating/src/config/runtimeConfig.ts:83-172`

### Build-time injection pipeline

`build-spfx-package.ts` reads CI/CD env vars and passes them to webpack DefinePlugin:

```
CI/CD env → build-spfx-package.ts:556-567 → webpack DefinePlugin → ShellWebPart.ts:21-26 → mount(config) → setRuntimeConfig()
```

The shell webpart (`ShellWebPart.ts:99-137`) constructs the config object conditionally — only including fields that are truthy strings or coerced booleans.

**Source:** `tools/build-spfx-package.ts:556-567`, `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts:99-137`

### Production readiness gating

Both apps implement `checkProductionReadiness(hasTokenProvider: boolean)` which requires:
1. Function App URL is resolved without error
2. API token provider is available

Project Setup additionally falls back to `ui-review` mode if production prerequisites are unmet, with console warnings.

**Source:** `apps/accounting/src/config/runtimeConfig.ts:179-202`, `apps/estimating/src/project-setup/backend/ProjectSetupBackendContext.tsx:209-262`

### Type duplication

Each app independently defines: `IRuntimeConfig`, `IMountConfig`, `BackendMode`, `IProductionModeReadiness`. There is **no shared contract** in `packages/models/` or any other shared package.

**Source:** Confirmed via grep — no shared runtime config types exist in `packages/`.

---

## 4. Confirmed repo facts about current Admin setup/install outputs

### Install orchestrator outputs

`executeInstallRun()` returns an `IAdminRunEnvelope` containing:
- Run lifecycle metadata (runId, status, timing)
- Step results array (`IAdminStepResult[]`) with per-step status, timing, and error messages
- Failure summary if applicable
- Audit trail references

The orchestrator does **not** extract, publish, or persist any binding-like values from step outputs.

**Source:** `backend/functions/src/services/admin-control-plane/install-orchestrator.ts:277-431`

### Install step catalog

The 19-step catalog includes steps that produce binding-relevant outputs:
- Step 7 (`deploy-function-app`) — produces the Function App URL
- Step 9 (`create-app-registration`) — produces the app registration client ID (basis for `apiAudience`)
- Step 10 (`grant-api-permissions`) — establishes API permission grants

However, none of these step outputs are captured as binding records. They exist only as step results in the run envelope.

**Source:** `backend/functions/src/services/admin-control-plane/install-orchestrator.ts:46-242`

### Config service status

`IAdminConfigService` exists as an interface with `getConfig(scope)` but the only implementation is `StubAdminConfigService` which returns:

```typescript
{ scope, version: '0.0.0', lastModifiedAt: new Date().toISOString(), lastModifiedBy: 'system', values: {} }
```

The service factory always wires the stub — no real implementation exists.

**Source:** `backend/functions/src/services/admin-control-plane/stubs.ts:117-128`, `backend/functions/src/hosts/admin-control-plane/service-factory.ts:101-115`

### API surface

14 admin API endpoints exist. `GET /api/admin/config/{scope}` calls the stub config service. No binding-specific endpoints exist.

**Source:** `backend/functions/src/functions/adminApi/index.ts:9-18`

### Persistence infrastructure

Azure Tables in use: `AdminRuns`, `AdminAuditEvents`, `AdminEvidence`, `ProvisioningStatus`, plus domain entity tables. **No table exists for app-binding or app-configuration state.**

**Source:** `backend/functions/src/services/table-storage-service.ts`, `backend/functions/src/services/admin-control-plane/admin-run-store.ts:40`

---

## 5. Confirmed gaps that prevent first-class app-binding from working today

| # | Gap | Impact |
|---|-----|--------|
| G1 | **No binding storage** — No Azure Table or persistence mechanism for per-app binding records | Binding values exist only as build-time constants; cannot be updated without rebuilding `.sppkg` |
| G2 | **No binding publication** — Install orchestrator does not extract or publish binding values from step outputs | Install completes successfully but does not make outputs available to target apps |
| G3 | **No runtime resolver API** — No endpoint for target apps to resolve their binding before backend-dependent execution | Target apps depend entirely on build-time injection; no runtime fallback from control plane |
| G4 | **No shared binding contract** — `IRuntimeConfig` and `IMountConfig` are duplicated per app; no shared type in `packages/models/` | Each app defines binding shape independently; no single contract governs what binding means |
| G5 | **No binding versioning** — No version tracking, provenance, or snapshot mechanism for published bindings | Cannot detect drift between published binding and live environment state |
| G6 | **No binding verification** — No health check comparing published binding values to live infrastructure state | Operator has no visibility into whether current binding is still valid |
| G7 | **No binding drift detection** — No mechanism to detect when infrastructure changes invalidate a published binding | Stale bindings persist silently until manual discovery |
| G8 | **No operator UX for binding** — Admin console has no page for viewing, managing, or repairing binding posture | Operator must check build configs or environment variables manually |
| G9 | **Config service is stub-only** — `IAdminConfigService` returns empty values; no real implementation | The Phase 3 config service interface exists but has never been implemented beyond stub |

---

## 6. Circular-dependency analysis for runtime resolution

### The core risk

A target app needs `functionAppUrl` to call the backend. If the binding resolution API lives on that same Function App, the app needs the URL before it can ask for the URL.

### Why this is solvable

The circular dependency does **not** apply in production for the following reasons:

1. **Build-time injection remains the primary path.** The SPFx shell webpart injects binding values from webpack DefinePlugin constants at `mount()` time. This path does not require a backend call and breaks no circular dependency.

2. **Runtime resolution is a verification/repair/fallback path, not the primary injection path.** The control plane publishes binding records. Target apps continue to receive binding at mount time via the shell. The runtime resolver serves:
   - The Admin operator console checking binding posture
   - Verification/drift checks comparing published binding to live state
   - Future scenarios where runtime resolution supplements or replaces build-time injection

3. **The Admin app already knows `functionAppUrl`.** The Admin app's own runtime config includes the Function App URL. It can resolve binding for managed apps via the admin API without any circular dependency.

4. **Target apps already have fallback behavior.** Both apps fall back to Vite env vars and defaults. Adding a control-plane resolution path is additive, not a replacement for existing injection.

### Recommended resolution model

- **Primary path:** Build-time injection via shell webpart (unchanged)
- **Authority path:** Control-plane binding store is the source of truth for what the binding values *should* be
- **Verification path:** Admin console compares published binding to live state and to build-injected values
- **Repair path:** Operator re-publishes binding via admin UX; rebuild `.sppkg` if build-time values must change
- **Future path:** Target apps could optionally call runtime resolver as a fallback if build-time injection is absent, but this is not required in the minimum slice

---

## 7. Recommended minimum slice to implement now

### Scope: the smallest forward-compatible binding system

| Component | What to build | Why needed |
|-----------|--------------|------------|
| **Shared binding contract** | `IAppBindingRecord`, `AppBindingStatus`, binding field types in `packages/models/` | Eliminates duplication; governs what binding means across all consumers |
| **Binding store** | Azure Table-backed `AppBindings` persistence with per-app records | Durable source of truth for published binding values |
| **Binding service** | `IAppBindingService` — publish, resolve, list, verify operations | Backend authority for binding lifecycle |
| **Binding publication from install** | Post-step extraction in install orchestrator — capture `functionAppUrl`, `apiAudience` from step outputs | Closes the gap between install completion and binding availability |
| **Binding resolution API** | `GET /api/admin/apps/{appId}/binding` — returns current binding for a managed app | Enables Admin UX and future target-app resolution |
| **Binding status API** | `GET /api/admin/apps/bindings` — returns binding posture for all managed apps | Enables Admin binding status dashboard |
| **Binding verification** | Compare published binding values to live infrastructure state | Detects drift and stale bindings |
| **Binding audit events** | `BindingPublished`, `BindingVerified`, `BindingDriftDetected`, `BindingRepaired` event types | Auditability consistent with Phase 4 model |
| **Admin binding UX** | Binding status page in Standards/Config or Setup lane — view, verify, repair | Operator visibility and repair initiation |

### What this slice does NOT build

- Full Phase 10 configuration registry
- Live-admin override of code-defined standards
- Generalized config versioning across all domains
- Automatic runtime resolution in target apps (target apps continue using build-time injection)
- Changes to the build pipeline or `.sppkg` packaging

---

## 8. Explicit non-goals

| Non-goal | Why excluded |
|----------|-------------|
| Replace build-time injection in target apps | Build-time injection works today; runtime resolution is additive |
| Implement full `IAdminConfigService` | That is Phase 10 scope — this slice uses a dedicated binding service |
| Add config governance UI for arbitrary settings | This slice governs only the 4 binding fields, not all config |
| Modify the SPFx shell webpart | Shell injection path is unchanged |
| Change `.sppkg` build pipeline | Build tooling is unchanged |
| Implement auto-remediation of drift | Operator-initiated repair only; auto-remediation is later maturity |
| Add new binding fields beyond the current 4 | The contract should be extensible but the minimum slice covers only `functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch` |
| Make target apps call the binding resolver at runtime | Target apps continue using build-time injection; the resolver serves the Admin UX and verification |
| Broad tenant-level configuration management | Scoped to HB Intel managed apps only |

---

## 9. Recommended execution order for Prompts 02–09

| Prompt | Title | Depends on | Rationale |
|--------|-------|-----------|-----------|
| **02** | App-Binding Architecture and Resolution Model | 01 (this audit) | Defines the binding model, resolution strategy, and layer responsibilities before any code |
| **03** | Shared App-Binding Contracts and Governance Slice | 02 | Creates the shared types in `packages/models/` that all subsequent code depends on |
| **04** | Backend App-Binding Store and Retrieval API | 03 | Implements the binding service, persistence, and API endpoints using the shared contracts |
| **05** | Install Flow Integration and Binding Publication | 04 | Integrates binding publication into the existing install orchestrator post-step flow |
| **06** | Target-App Runtime Resolver Integration | 03 | Adds shared resolution utilities to target apps (can proceed in parallel with 04-05 if contracts are stable) |
| **07** | App-Binding Verification and Drift Checks | 04, 05 | Requires the binding store and published bindings to exist before verification can compare them to live state |
| **08** | Admin UX for App-Binding Status and Repair | 04, 07 | Requires binding API and verification to exist before the UX can display posture and initiate repair |
| **09** | Docs, Runbooks, Validation, and Final Reconciliation | 02-08 | Wraps up all documentation, updates runbooks, and validates end-to-end |

### Parallelization opportunities

- Prompts 04 and 06 can overlap if the shared contracts from Prompt 03 are stable
- Prompts 07 and 08 are sequential (verification before UX)
- Prompt 09 is always last

---

## 10. Path convention note

The governing prompt specifies the output path as `phase-6a-app-binding/` rather than `phase-06a/`. This document follows the prompt's specified path. The `phase-06a/` directory contains the upstream reconciliation package; `phase-6a-app-binding/` contains the implementation audit and artifacts for the app-binding slice itself.
