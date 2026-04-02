# Admin SPFx IT Control Center — Phase 3 Runtime Foundation Inventory

**Prompt:** P3-01 — Phase 3 Prerequisite Audit and Runtime Foundation Inventory  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Establish the smallest trustworthy authority set for Phase 3 and produce a repo-truth inventory of the backend runtime foundations that already exist.

---

## 1. Authority order used

| Priority | Source | Role |
|----------|--------|------|
| 1 | Verified live code and configuration | Primary implementation truth |
| 2 | [`current-state-map.md`](../../../../../docs/architecture/blueprint/current-state-map.md) | Canonical present-truth document |
| 3 | Executed Phase 2 admin contract artifacts (confirmed present — see Section 2) | Immediate architectural prerequisites |
| 4 | Local package/app READMEs and tests | Runtime behavior verification |
| 5 | [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md) | Phase scope and sequence |
| 6 | [Target architecture](../admin-spfx-target-architecture.md) | Intended end-state shape |

---

## 2. Phase 2 prerequisite status

### 2.1 Phase 2 canonical documentation artifacts

All 9 expected Phase 2 canonical docs are **confirmed present** in the repo.

| # | Artifact | Path | Status |
|---|----------|------|--------|
| 1 | Prerequisite and contract inventory | [`admin-spfx-phase-2-prereq-and-contract-inventory.md`](../phase-02/admin-spfx-phase-2-prereq-and-contract-inventory.md) | Present |
| 2 | Action catalog | [`admin-control-plane-action-catalog.md`](../phase-02/admin-control-plane-action-catalog.md) | Present |
| 3 | Run model | [`admin-control-plane-run-model.md`](../phase-02/admin-control-plane-run-model.md) | Present |
| 4 | API contract catalog | [`admin-control-plane-api-contract-catalog.md`](../phase-02/admin-control-plane-api-contract-catalog.md) | Present |
| 5 | Checkpoint and execution modes | [`admin-control-plane-checkpoint-and-execution-modes.md`](../phase-02/admin-control-plane-checkpoint-and-execution-modes.md) | Present |
| 6 | Audit, evidence, and config contracts | [`admin-control-plane-audit-evidence-and-config-contracts.md`](../phase-02/admin-control-plane-audit-evidence-and-config-contracts.md) | Present |
| 7 | Adapter registry contract | [`admin-control-plane-adapter-registry-contract.md`](../phase-02/admin-control-plane-adapter-registry-contract.md) | Present |
| 8 | Package placement and boundary map | [`admin-control-plane-package-placement-and-boundary-map.md`](../phase-02/admin-control-plane-package-placement-and-boundary-map.md) | Present |
| 9 | Phase 2 decision register | [`admin-control-plane-phase-2-decision-register.md`](../phase-02/admin-control-plane-phase-2-decision-register.md) | Present |

### 2.2 Phase 2 type exports in `@hbc/models/admin-control-plane`

58 pure-type exports confirmed across 7 source files + barrel in [`packages/models/src/admin-control-plane/`](../../../../../packages/models/src/admin-control-plane/index.ts).

| Source file | Enums | Types/Interfaces | Exports |
|-------------|-------|-------------------|---------|
| `AdminEnums.ts` | `AdminDomain`, `AdminRiskLevel`, `AdminExecutionMode` | — | 3 |
| `types.ts` | — | `AdminActionKey`, `IAdminActionDescriptor` | 2 |
| `IAdminRun.ts` | `AdminRunStatus`, `AdminStepStatus` | `IAdminActorContext`, `IAdminStepResult`, `IAdminFailureSummary`, `IAdminRunEnvelope` | 6 |
| `IAdminApi.ts` | — | 23 request/response DTOs for 11 endpoint contracts | 23 |
| `IAdminCheckpoint.ts` | `AdminCheckpointCategory`, `AdminCheckpointStatus` | `IAdminCheckpointDefinition`, `IAdminCheckpoint`, `IAdminCheckpointDecision`, `IAdminExternalEventCorrelation` | 6 |
| `IAdminAudit.ts` | `AdminAuditEventType`, `AdminEvidenceType` | `IAdminAuditRecord`, `IAdminEvidenceReference`, `IAdminConfigSnapshotReference`, `IAdminStandardsReference`, `IAdminRationale`, `IAdminPostRunValidationSummary`, `IAdminPostRunValidationCheck`, `IAdminRunConfigTrace` | 10 |
| `IAdminAdapter.ts` | `AdminAdapterCategory`, `AdminAdapterOutcome` | `IAdminAdapterDescriptor`, `IAdminAdapterInvocationContext`, `IAdminAdapterResult`, `IAdminAdapterWarning`, `IAdminAdapterIssue`, `IAdminRemediationHint` | 8 |
| **Total** | **11 enums** | **47 types/interfaces** | **58** |

All exports are **pure types** with no runtime dependencies, no validation schemas, and no orchestrator logic (per Phase 2 decision P2-D05).

### 2.3 Phase 2 prerequisite conclusion

Phase 2 prerequisites are **fully satisfied**. No Phase 3 blockers exist from missing Phase 2 outputs.

---

## 3. Inventory of current runtime foundations

### 3.1 Backend host model (two-tier)

The repo uses a two-tier deployment model established by ADR-0124.

| Host | Entry point | Route families | Service scope |
|------|------------|----------------|---------------|
| Monolithic | `backend/functions/src/index.ts` | 19 (8 Project Setup + 10 domain CRUD + 1 proxy) | All services (9 eager + 10 lazy) |
| Project-Setup | [`backend/functions/src/hosts/project-setup/index.ts`](../../../../../backend/functions/src/hosts/project-setup/index.ts) | 8 (Project Setup domain boundary only) | 9 eager services only |

**Boundary enforcement:**
- The Project-Setup host **excludes** domain CRUD handlers at the composition-root level (imports are absent, not conditionally disabled).
- `IProjectSetupServiceContainer` **type-excludes** domain CRUD services at compile time.
- [`project-setup-host-boundary.test.ts`](../../../../../backend/functions/src/test/project-setup-host-boundary.test.ts) validates that all 8 PS routes are included and all 10 domain CRUD routes are excluded.
- [`RELEASE-SCOPE.md`](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md) is the machine-checkable boundary specification.

### 3.2 Service factory pattern

| Factory | File | Interface | Services |
|---------|------|-----------|----------|
| Monolithic | `backend/functions/src/services/service-factory.ts` | `IServiceContainer` | 9 eager core + 10 lazy domain CRUD |
| Project-Setup | [`backend/functions/src/hosts/project-setup/service-factory.ts`](../../../../../backend/functions/src/hosts/project-setup/service-factory.ts) | `IProjectSetupServiceContainer` | 9 eager core only |

**Key patterns:**
- `HBC_ADAPTER_MODE` environment variable determines runtime flavor (`'real'` / `'mock'` / `'test'`).
- `assertAdapterModeValid()` guard rejects mock in production.
- All services have Real/Mock implementation pairs.
- Lazy initialization pattern caches domain CRUD services via closure (monolithic factory only).
- Handlers call the factory function directly (no explicit DI container injection).

### 3.3 Middleware stack

| Layer | File | Purpose |
|-------|------|---------|
| Auth | `backend/functions/src/middleware/auth.ts` | Bearer token extraction from `Authorization` header; `withAuth()` higher-order function wrapper |
| Token validation | `backend/functions/src/middleware/validateToken.ts` | JWT validation against Entra ID JWKS; parses `IValidatedClaims` (roles, scopes, upn, oid, idtyp); caches JWKS |
| Authorization | `backend/functions/src/middleware/authorization.ts` | Role checks (`isAdmin`, `isController`, `isPrivileged`); scope checks (`requireDelegatedScope`); ownership checks; role constants (`ADMIN_ROLES`, `CONTROLLER_ROLES`, `BREAK_GLASS_ROLES`, `AUTOMATION_ROLES`) |
| Request ID | `backend/functions/src/middleware/request-id.ts` | Extracts `X-Request-Id` header or generates UUID for correlation |
| Telemetry | `backend/functions/src/utils/withTelemetry.ts` | Emits `handler.invoke` / `handler.success` / `handler.error` events; captures duration, status code, correlation ID; metadata per handler `{ domain, operation }` |

**Composition pattern:** `handler: withAuth(withTelemetry(asyncHandler, { domain, operation }))`

### 3.4 Route registration pattern

- Routes are registered declaratively via `app.http()` and `app.timer()` at module level.
- Each function file (e.g., `backend/functions/src/functions/projectRequests/index.ts`) calls `app.http()` upon import.
- Composition roots control which route families are active by selectively importing function indices.
- **Current scope:** 27 HTTP endpoints + 2 timer triggers across 19 route families.

### 3.5 Provisioning saga

| Component | Location | Purpose |
|-----------|----------|---------|
| SagaOrchestrator | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | 7-step orchestration with retry, compensation, audit |
| Saga steps | `backend/functions/src/functions/provisioningSaga/steps/` | Individual provisioning step implementations |
| Graph adapter | `backend/functions/src/services/graph-service.ts` | Microsoft Graph API client (`IGraphService`) |
| SharePoint adapter | `backend/functions/src/services/sharepoint-service.ts` | SPFx site/group management (`ISharePointService`) |
| Table Storage adapter | `backend/functions/src/services/table-storage-service.ts` | Azure Table Storage persistence (`ITableStorageService`) |
| SignalR adapter | `backend/functions/src/services/signalr-push-service.ts` | Real-time provisioning updates (`ISignalRPushService`) |
| State machine | `backend/functions/src/state-machine.ts` | Project state transition logic |

### 3.6 Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| Response helpers | `backend/functions/src/utils/response-helpers.ts` | `successResponse()`, `errorResponse()` HTTP response builders |
| Config validation | `backend/functions/src/utils/validate-config.ts` | Tiered startup validation (core blocking, SharePoint warning, provisioning deferred) |
| Logger | `backend/functions/src/utils/logger.ts` | Correlation ID propagation + Application Insights integration |
| Idempotency | `backend/functions/src/idempotency/` | `with-idempotency.ts` and `idempotency-guard.ts` write-safety patterns |
| Retry | `backend/functions/src/utils/` | Retry utility functions |

### 3.7 Frontend: `apps/admin`

| Aspect | Detail |
|--------|--------|
| Routes | 4 routes: `/` (System Settings), `/dashboards`, `/error-log`, `/provisioning-failures` |
| Permission gate | `admin:access-control:view` enforced before load |
| Backend communication | [`ProvisioningOversightPage`](../../../../../apps/admin/src/pages/ProvisioningOversightPage.tsx) → `createProvisioningApiClient` with factory token injection via `createSessionTokenFactory()` |
| Provider stack | HbcThemeProvider → HbcToastProvider → QueryClientProvider → HbcErrorBoundary → ComplexityProvider → RouterProvider |
| Version | `00.000.046` |

### 3.8 `@hbc/provisioning`

| Aspect | Detail |
|--------|--------|
| Package type | Headless (no React components) — per ADR-0077, D-PH6-09 |
| API client | `createProvisioningApiClient(baseUrl, getToken)` — stateless factory with Bearer token injection |
| Store | Zustand with dual-authority design: API authoritative, SignalR enhancement layer; stale-event guard via `correlationId` |
| State machine | `Submitted` → `UnderReview` → `ReadyToProvision` → `Provisioning` → `Completed` / `Failed` |
| Public exports | 23 (API client, store hook, SignalR hook, state validators, BIC contracts, handoff config, registries) |
| README | [`packages/provisioning/README.md`](../../../../../packages/provisioning/README.md) |

### 3.9 `@hbc/features-admin`

| Aspect | Detail |
|--------|--------|
| Role | Admin intelligence feature layer — **not** the privileged control plane |
| Monitors | `MonitorRegistry` with `provisioningFailureMonitor`, `stuckWorkflowMonitor`; returns `IAdminAlert[]` |
| Probes | `ProbeScheduler` with live probes (`azureFunctionsProbe`, `sharePointProbe`) and deferred stubs |
| Alert API | In-memory `Map`-backed store (Wave 0); `ingestAlerts()`, `listActive()`, `acknowledge()`, `listHistory()` |
| Approval authority | Stub implementation (Wave 0); rules storage, eligibility resolution |
| Boundary safety | Uses `IProvisioningDataProvider` injection — does **not** import `@hbc/provisioning` directly |
| README | [`packages/features/admin/README.md`](../../../../../packages/features/admin/README.md) |

### 3.10 `@hbc/models/admin-control-plane`

See Section 2.2 for the full export inventory. Key characteristics:
- All 58 exports are **pure types** — no runtime dependencies.
- Validation schemas intentionally deferred to Phase 3 (per P2-D05).
- Action keys use `domain:family:verb` template literal pattern (per P2-D04).
- The run model is a **translation target**, not a replacement for provisioning types (per P2-D06).
- All exports stay in `@hbc/models` — no new package created (per P2-D14).

---

## 4. Generalize / retain / missing classification

### 4.1 Reusable as-is

These foundations can be consumed by the admin-control-plane host without modification.

| Foundation | Location | Why reusable |
|------------|----------|--------------|
| Auth middleware (`withAuth`) | `backend/functions/src/middleware/auth.ts` | Bearer token extraction is domain-agnostic |
| Token validation | `backend/functions/src/middleware/validateToken.ts` | Entra ID JWKS validation is shared infrastructure |
| Authorization helpers | `backend/functions/src/middleware/authorization.ts` | Role/scope constants and check functions are reusable |
| Request ID middleware | `backend/functions/src/middleware/request-id.ts` | Correlation ID extraction is domain-agnostic |
| Telemetry wrapper | `backend/functions/src/utils/withTelemetry.ts` | Handler lifecycle telemetry accepts domain/operation metadata |
| Response helpers | `backend/functions/src/utils/response-helpers.ts` | `successResponse()` / `errorResponse()` are domain-agnostic (per P2-D07) |
| Idempotency patterns | `backend/functions/src/idempotency/` | Write-safety guards are domain-agnostic |
| Logger | `backend/functions/src/utils/logger.ts` | Correlation ID and Application Insights integration are shared |
| Config validation pattern | `backend/functions/src/utils/validate-config.ts` | Tiered validation pattern is reusable; config values will differ |
| Adapter mode guard | `backend/functions/src/utils/` | `HBC_ADAPTER_MODE` and `assertAdapterModeValid()` are shared |

### 4.2 Reusable but should be generalized

These foundations provide proven patterns that Phase 3 should replicate for the admin-control-plane scope.

| Current form | Location | Generalized need | Notes |
|-------------|----------|------------------|-------|
| Project-Setup host/composition root | `backend/functions/src/hosts/project-setup/index.ts` | Admin-control-plane host with own composition root | Same selective-import pattern; different route families |
| Project-Setup service factory | `backend/functions/src/hosts/project-setup/service-factory.ts` | Admin-control-plane service factory with `IAdminControlPlaneServiceContainer` | Same typed-container pattern; different service set |
| Route registration mechanism | `backend/functions/src/functions/*/index.ts` | New admin route families using same `app.http()` + `withAuth(withTelemetry(...))` composition | Pattern is reusable; need new handler implementations |
| RELEASE-SCOPE.md boundary manifest | [`backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md) | Admin-control-plane RELEASE-SCOPE.md with in-scope/excluded route families | Same manifest format; different boundary content |
| Host-boundary test | `backend/functions/src/test/project-setup-host-boundary.test.ts` | Admin-control-plane host-boundary test | Same validation approach; different route assertions |
| `host.json` configuration | `backend/functions/src/hosts/project-setup/host.json` | Admin-control-plane `host.json` | Same Azure Functions config shape; potentially different CORS/timeout |

### 4.3 Provisioning-specific (retain as-is)

These foundations are provisioning-domain-specific and should not be generalized or absorbed into the admin control plane.

| Foundation | Location | Why retain |
|------------|----------|------------|
| SagaOrchestrator | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Provisioning-specific 7-step workflow with domain-specific compensation logic |
| Provisioning saga steps | `backend/functions/src/functions/provisioningSaga/steps/` | Each step implements provisioning-specific business logic |
| Provisioning API client | `packages/provisioning/src/api-client.ts` | Domain-specific endpoint vocabulary; generalized admin API client is a separate concern |
| Provisioning Zustand store | `packages/provisioning/src/store.ts` | Dual-authority design is provisioning-specific; admin runs will need their own state management |
| Provisioning state machine | `packages/provisioning/src/state-machine.ts` | State transitions are provisioning-specific (`Submitted` → `UnderReview` → `Provisioning` → `Completed`) |
| SignalR provisioning protocol | `packages/provisioning/src/hooks/useProvisioningSignalR.ts` | `provisioningProgress` event shape and merge logic are provisioning-specific |
| BIC config/registration | `packages/provisioning/src/bic-config.ts` | Provisioning-specific ownership and workflow rules |
| Coaching/failure/summary registries | `packages/provisioning/src/` | Domain-specific display registries |

### 4.4 Missing — must be added in Phase 3

These runtime foundations do not exist in the repo and must be created during Phase 3.

| Gap | What Phase 3 must produce | Required by |
|-----|--------------------------|-------------|
| Admin-control-plane host | `backend/functions/src/hosts/admin-control-plane/` with index.ts, service-factory.ts, host.json, RELEASE-SCOPE.md | All subsequent Phase 3 prompts |
| Admin-control-plane service factory | `IAdminControlPlaneServiceContainer` with scoped admin services | Prompts 02–03 |
| Admin API route families | Route handlers for launch, status, history, retry, repair, validate, config | Prompts 04–05 |
| Adapter registry runtime | Runtime registration and execution routing for `IAdminAdapterDescriptor` | Prompt 06 |
| Orchestration bridge | Dispatch layer that can invoke provisioning saga through generalized admin run semantics | Prompt 07 |
| Admin-specific authorization wiring | Control-plane action authorization beyond generic `withAuth()` | Prompt 08 |
| Admin API client seam | Generalized admin API client in `apps/admin` replacing direct provisioning-only calls for admin scope | Prompt 04+ |

---

## 5. Explicit Phase 3 runtime gaps

### Gap 1 — No admin-control-plane host exists

**Evidence:** `backend/functions/src/hosts/` contains only `project-setup/`. No `admin-control-plane/` directory exists.

**Impact:** Without a scoped host, admin API routes would have to be added to the monolithic host, violating the domain-host doctrine established by ADR-0124 and proven by the Project-Setup host.

### Gap 2 — No admin-scoped service container exists

**Evidence:** `IServiceContainer` (monolithic) and `IProjectSetupServiceContainer` (project-setup) exist. No admin-control-plane container exists.

**Impact:** Without a typed container, admin handlers would either use the monolithic container (accessing services they should not need) or have no compile-time boundary enforcement.

### Gap 3 — No admin API routes exist

**Evidence:** All current admin-surface backend calls go through provisioning-specific endpoints (`/api/project-setup-requests`, `/api/provision-project-site`). No generalized admin launch/status/history/retry/repair/validate/config endpoints exist.

**Impact:** The admin operator console cannot trigger or poll generalized admin runs. All backend interaction is provisioning-specific.

### Gap 4 — No adapter registry runtime exists

**Evidence:** Phase 2 defined `IAdminAdapterDescriptor`, `IAdminAdapterInvocationContext`, and `IAdminAdapterResult` as pure types. No runtime registration, lookup, or execution routing code exists in `backend/functions/`.

**Impact:** Without an adapter registry, each admin domain would need to hard-code adapter selection, duplicating dispatch logic per domain.

### Gap 5 — No orchestration bridge exists

**Evidence:** The provisioning saga is invoked directly through provisioning-specific route handlers. No generalized dispatch layer exists that could invoke provisioning (or any other domain) through admin run semantics.

**Impact:** Without a bridge, generalized admin runs cannot delegate to existing provisioning execution, and later domains (SharePoint control, Entra control) would need separate integration patterns.

### Gap 6 — No admin-specific authorization for control-plane actions

**Evidence:** `withAuth()` handles generic Bearer token extraction. `authorization.ts` provides role checks (`isAdmin`, `isController`, `isPrivileged`). However, no authorization logic exists that maps admin control-plane actions to required roles/permissions based on action domain, risk level, or execution mode.

**Impact:** Without action-aware authorization, all admin control-plane actions would share the same authorization gate, preventing risk-differentiated access control.

### Gap 7 — No generalized admin API client seam in `apps/admin`

**Evidence:** `ProvisioningOversightPage` calls `createProvisioningApiClient` from `@hbc/provisioning`. No generalized admin API client exists for launch/status/history/retry/repair/validate/config operations.

**Impact:** The admin app cannot consume generalized admin API endpoints without a boundary-safe client seam.

---

## 6. Host-boundary recommendation

### Recommendation

Create `backend/functions/src/hosts/admin-control-plane/` following the proven Project-Setup host pattern.

### Required files

| File | Purpose | Modeled after |
|------|---------|---------------|
| `index.ts` | Composition root — selective route-family imports for admin-control-plane scope | `hosts/project-setup/index.ts` |
| `service-factory.ts` | Scoped factory returning `IAdminControlPlaneServiceContainer` | `hosts/project-setup/service-factory.ts` |
| `host.json` | Azure Functions configuration (CORS, routing, timeout) | `hosts/project-setup/host.json` |
| `RELEASE-SCOPE.md` | Machine-checkable boundary specification with in-scope and excluded route families | `hosts/project-setup/RELEASE-SCOPE.md` |

### Required test

A host-boundary test following the pattern in `backend/functions/src/test/project-setup-host-boundary.test.ts` that validates:
- All admin-control-plane route families are included.
- All non-admin route families are excluded.
- The service container type does not expose services outside the admin-control-plane scope.

### Evidence supporting this recommendation

| Source | Signal |
|--------|--------|
| ADR-0124 | Established domain-host doctrine for the repo |
| Project-Setup host | Proves scoped domain hosts are valid, tested, and deployed |
| [`RELEASE-SCOPE.md`](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md) | Proves boundary specification manifests are repo doctrine |
| Phase 2 contracts | 58 pure types already defined in `@hbc/models/admin-control-plane` — the domain boundary exists in the type system |
| [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md) | Explicitly calls for "generalized admin backend host/composition-root strategy" |
| [Target architecture](../admin-spfx-target-architecture.md) | Describes the orchestration backend as a separate privileged control plane |

---

## 7. Composition-root and service-container pattern summary

This section documents the patterns the repo currently uses so that later Phase 3 prompts can follow them without re-discovery.

### Composition root pattern

1. Each host has an `index.ts` that **selectively imports** function module indices.
2. Each function module index (e.g., `functions/projectRequests/index.ts`) calls `app.http()` or `app.timer()` at module load time, registering its routes with the Azure Functions v4 runtime.
3. A host controls its route surface by choosing which function indices to import. Functions not imported are not registered and not available.

### Service container pattern

1. Each host has a `service-factory.ts` that exports a `createXxxServiceFactory()` function.
2. The factory reads `HBC_ADAPTER_MODE` to select real or mock service implementations.
3. The factory returns a typed interface (`IXxxServiceContainer`) that constrains which services are available to handlers.
4. Handlers call the factory function directly to obtain the container.
5. The typed interface provides **compile-time enforcement** — services outside the container are inaccessible to handlers using it.

### Config validation pattern

1. Startup validation is **tiered**: core config is blocking, secondary config is warning-only, and execution-time config is validated on demand.
2. The pattern uses `validate-config.ts` with domain-specific validation rules.

### Handler composition pattern

```
handler: withAuth(withTelemetry(asyncHandler, { domain, operation }))
```

1. `withAuth()` extracts the Bearer token, validates it, and passes `AuthContext` to the inner handler.
2. `withTelemetry()` wraps the handler with lifecycle events and duration tracking.
3. The async handler receives `(request, context, auth)` and implements domain logic.

---

## Cross-references

### Target architecture
- [Admin SPFx target architecture](../admin-spfx-target-architecture.md)

### Phase 1 artifacts
- [Phase 1 architecture baseline](../phase-01/admin-spfx-phase-1-architecture-baseline.md)
- [Boundary matrix](../phase-01/admin-spfx-boundary-matrix.md)
- [Locked decisions and phase boundary guards](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md)

### Phase 2 artifacts
- [Phase 2 prerequisite and contract inventory](../phase-02/admin-spfx-phase-2-prereq-and-contract-inventory.md)
- [Action catalog](../phase-02/admin-control-plane-action-catalog.md)
- [Run model](../phase-02/admin-control-plane-run-model.md)
- [API contract catalog](../phase-02/admin-control-plane-api-contract-catalog.md)
- [Checkpoint and execution modes](../phase-02/admin-control-plane-checkpoint-and-execution-modes.md)
- [Audit, evidence, and config contracts](../phase-02/admin-control-plane-audit-evidence-and-config-contracts.md)
- [Adapter registry contract](../phase-02/admin-control-plane-adapter-registry-contract.md)
- [Package placement and boundary map](../phase-02/admin-control-plane-package-placement-and-boundary-map.md)
- [Phase 2 decision register](../phase-02/admin-control-plane-phase-2-decision-register.md)

### Backend source references
- [Project-Setup host composition root](../../../../../backend/functions/src/hosts/project-setup/index.ts)
- [Project-Setup service factory](../../../../../backend/functions/src/hosts/project-setup/service-factory.ts)
- [Project-Setup RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md)
- [Project-Setup host-boundary test](../../../../../backend/functions/src/test/project-setup-host-boundary.test.ts)

### Package references
- [`@hbc/provisioning` README](../../../../../packages/provisioning/README.md)
- [`@hbc/features-admin` README](../../../../../packages/features/admin/README.md)
- [`@hbc/models/admin-control-plane` barrel](../../../../../packages/models/src/admin-control-plane/index.ts)

### Operator surface proof
- [ProvisioningOversightPage](../../../../../apps/admin/src/pages/ProvisioningOversightPage.tsx)
