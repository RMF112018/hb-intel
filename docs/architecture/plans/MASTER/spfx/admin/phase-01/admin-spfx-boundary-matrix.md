# Admin SPFx IT Control Center — Boundary Matrix and Layer Ownership Doctrine

## 1. Purpose

This document is the canonical capability-to-layer ownership matrix for the Admin SPFx IT Control Center. It defines where every major capability belongs, who supports it, and what is explicitly prohibited.

Any implementation phase that places logic in a layer must be consistent with this matrix. If a future phase needs to move a capability across layers, that requires a deliberate ADR — not silent drift.

## 2. How to use this matrix

- **Before implementing a feature**: find the relevant capability row. Confirm your code goes in the primary owner layer.
- **Before a code review**: check that the PR does not place logic in a layer listed under "Explicitly not owned by."
- **Before adding a dependency**: confirm the dependency direction is consistent with the layer definitions.
- **When in doubt**: use the boundary review checklist at the end of this document.

## 3. Layer definitions

| Layer | Identity | Repo anchor | Role |
|-------|----------|-------------|------|
| **SPFx operator console** | `apps/admin` | `apps/admin/src/` | Human-facing shell. Observe, initiate, manage. Never execute privileged actions directly. |
| **Admin intelligence** | `@hbc/features-admin` | `packages/features/admin/src/` | Reusable monitors, probes, APIs, hooks, dashboards. Not the control plane. |
| **Reusable visual UI** | `@hbc/ui-kit` | `packages/ui-kit/src/` | Shared visual components consumed by all apps. No feature logic. |
| **Privileged backend / control plane** | `backend/functions` | `backend/functions/src/` | Orchestration, retries, compensation, privileged execution, durable state. |
| **Adapters** | Backend service modules | `backend/functions/src/services/` | Platform-specific execution: Graph, SharePoint, Azure Tables. Invoked by control plane. |
| **Run / audit persistence** | Azure Table Storage | `backend/functions/src/services/table-storage-service.ts` | Durable run identity, step results, escalation, audit records. |
| **Standards / config governance** | Not yet implemented | TBD (Phase 10) | Code defaults, governed live config, versioning, audit trail, drift baseline. |

## 4. Capability ownership matrix

### Operator-facing capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Setup / install workflow UX | SPFx console | — | Operator-facing wizard and form UX | Backend, adapters | Not yet implemented | Phase 6 |
| Preflight validation UX | SPFx console | Admin intelligence (probes) | Validation results displayed to operator | Backend (execution only) | `@hbc/features-admin` probes | Phase 6 |
| Run launch (trigger) | SPFx console | Backend (receives trigger) | Operator initiates; backend executes | SPFx must not execute | `ProvisioningOversightPage.tsx` | Generalize in Phase 5 |
| Run status and history viewing | SPFx console | Backend (API), persistence (queried) | Read-only operator visibility | Persistence internals not exposed | `ProvisioningOversightPage.tsx` | Generalize in Phase 5 |
| Log / audit browsing | SPFx console | Backend (API), persistence (queried) | Read-only operator visibility | Persistence internals not exposed | `ErrorLogPage.tsx` (placeholder) | Phase 12 |
| High-risk action initiation | SPFx console | Backend (checkpoint enforcement) | Operator triggers with risk-aware UX | SPFx must not execute the action | Not yet implemented | Phase 11 |
| Approval / checkpoint UX | SPFx console | Backend (pauses for approval) | Operator sees checkpoint, approves/rejects | SPFx must not enforce checkpoint logic | `ApprovalAuthorityTable` (Wave 0) | Phase 5+ |
| Alert / probe visibility | SPFx console | Admin intelligence (data source) | Operator dashboard | — | `AdminAlertBadge`, root-route polling | — |
| Complexity-tier gating | SPFx console | — | Controls feature exposure by operator tier | — | `ComplexityProvider` in `App.tsx` | — |
| Navigation / IA | SPFx console | Shell (`@hbc/shell`) | Operator workflow navigation | — | `root-route.tsx` tool picker | Rework in Phase 5 |

### Control-plane capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Durable orchestration | Backend / control plane | Adapters (invoked), persistence (state written) | Requires server-side durability, cannot survive browser close | SPFx, admin intelligence | `saga-orchestrator.ts` | Generalize in Phase 3 |
| Retries | Backend / control plane | Adapters (re-invoked) | Retry policy is a server-side concern | SPFx | `withRetry` in saga orchestrator | — |
| Compensation | Backend / control plane | Adapters (compensating actions) | Rollback decisions require orchestrator context | SPFx | Saga compensators (Steps 7→1) | — |
| Repair decisions | Backend / control plane | Adapters (repair execution) | Requires privileged access and orchestrator state | SPFx | Not yet generalized | Phase 7+ |
| Checkpoint enforcement | Backend / control plane | SPFx (approval UX) | Backend pauses execution; SPFx shows checkpoint | SPFx must not enforce | Not yet implemented | Phase 5+ |
| Command routing | Backend / control plane | Adapters (dispatched to) | Central dispatch to appropriate adapter | SPFx | Not yet generalized | Phase 3 |
| Progress signaling | Backend / control plane | SPFx (receives via SignalR) | Real-time push from server to operator console | — | SignalR push in saga | — |
| Escalation handling | Backend / control plane | Persistence (escalation records) | Server-side escalation state management | SPFx (read-only visibility OK) | `escalateProvisioning` in table storage | — |
| Request reconciliation | Backend / control plane | Persistence (state updates) | Keeps request state in sync with run outcomes | SPFx | Saga request reconciliation | — |

### Adapter capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Graph-backed Entra changes | Adapters (Graph service) | Backend (invokes) | Privileged Graph write operations | SPFx, admin intelligence | `graph-service.ts` | Extend in Phase 9 |
| SharePoint ALM / package posture actions | Adapters (SharePoint service) | Backend (invokes) | Privileged SharePoint admin execution | SPFx, admin intelligence | `sharepoint-service.ts` | Extend in Phase 8 |
| Azure resource deployment | Adapters (not yet implemented) | Backend (invokes) | Privileged ARM/Bicep execution | SPFx | Not yet implemented | Phase 6 |
| Site lifecycle management | Adapters (SharePoint service) | Backend (invokes) | Privileged site creation, deletion, hub operations | SPFx | `sharepoint-service.ts` | — |
| Permission assignment | Adapters (SharePoint + Graph) | Backend (invokes) | Privileged role/group operations | SPFx | `assignGroupToPermissionLevel`, `addGroupMembers` | — |

### Persistence capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Run persistence | Persistence (Azure Tables) | Backend (writes), SPFx (reads via API) | Durable, survives session end, reconstructable | SPFx (no direct write), admin intelligence | `table-storage-service.ts` | Generalize in Phase 4 |
| Audit persistence | Persistence (Azure Tables + SharePoint audit list) | Backend (writes) | Dual-store audit for compliance and traceability | SPFx (no direct write), admin intelligence | `writeAuditRecord` in SP service, `upsertProvisioningStatus` in table storage | Generalize in Phase 4 |
| Per-run evidence traceability | Persistence | Backend (writes evidence) | Run identity chains, correlation IDs, input snapshots | SPFx | `correlationId` / `parentCorrelationId` in saga | Phase 4 |

### Standards and configuration capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Standards comparison | Backend / control plane | Adapters (reads current state), config governance (reference standard) | Requires access to live environment and standard definition | SPFx (visibility only) | Not yet implemented | Phase 8 |
| Standards application / reapplication | Backend / control plane | Adapters (executes changes) | Privileged write operations | SPFx (trigger only) | Not yet implemented | Phase 8 |
| Governed configuration resolution | Config governance | Backend (resolves at run time) | Source-of-truth engine for what the standard is | SPFx (management UX only) | Not yet implemented | Phase 10 |

### Reusable / shared capabilities

| Capability / concern | Primary owner | Supporting layer(s) | Why it belongs there | Explicitly not owned by | Current repo anchor | Later-phase notes |
|---|---|---|---|---|---|---|
| Reusable alert / probe / dashboard behavior | Admin intelligence (`@hbc/features-admin`) | SPFx (consumes) | Reusable cross-surface admin logic | Backend (not a consumer) | `packages/features/admin/src/` | — |
| Reusable visual shell components | `@hbc/ui-kit` | SPFx (consumes), admin intelligence (consumes) | Single ownership for visual primitives | Feature packages must not duplicate | `packages/ui-kit/src/` | — |

## 5. Package/app ownership notes

### apps/admin

- **Role**: SPFx operator console.
- **May contain**: Route definitions, page composition, operator UX, complexity gating, permission checks, API call orchestration (triggering runs, reading status), polling hooks, navigation.
- **Must not contain**: Privileged Graph/SharePoint writes, durable orchestration, retry/compensation logic, audit persistence internals, reusable visual primitives.
- **Dependency direction**: Consumes `@hbc/features-admin`, `@hbc/ui-kit`, `@hbc/shell`, `@hbc/auth`, `@hbc/provisioning`, `@hbc/complexity`. Does not export to other apps.

### packages/features/admin (@hbc/features-admin)

- **Role**: Reusable admin intelligence layer.
- **May contain**: Monitors, probes, alert APIs, approval authority logic, admin-oriented hooks, dashboard components, integration adapters (e.g., Teams webhook dispatch), testing mocks.
- **Must not contain**: Privileged execution, durable orchestration, run persistence, control-plane API endpoints, privileged Graph/SharePoint operations.
- **Dependency direction**: Consumed by `apps/admin`. May depend on `@hbc/models`, `@hbc/ui-kit`, `@hbc/auth`, `@hbc/shell`. Must not depend on `backend/functions`.

### @hbc/ui-kit

- **Role**: Shared visual component library.
- **May contain**: Reusable visual primitives (buttons, cards, layouts, empty states, badges, tables, modals, etc.) used across multiple apps.
- **Must not contain**: Feature logic, admin-specific behavior, API calls, state management beyond component-local concerns.
- **Dependency direction**: Consumed by all apps and feature packages. Must not depend on feature packages.

### backend/functions

- **Role**: Privileged backend / control plane.
- **May contain**: API endpoints, orchestrators, service factory, adapter implementations, run/audit persistence, retry/compensation logic, command routing, progress signaling, escalation handling, config resolution.
- **Must not contain**: UI components, browser-side rendering, operator UX logic.
- **Dependency direction**: Standalone. Does not import from frontend packages. May share types via `@hbc/models` if needed.

### Provisioning foundations / adapters

- **Role**: Existing production-grade control-plane implementation for provisioning domain.
- **Includes**: `saga-orchestrator.ts`, `graph-service.ts`, `sharepoint-service.ts`, `table-storage-service.ts`, `service-factory.ts`.
- **Treatment**: Seed crystal for generalization. Later phases extend the patterns; they do not discard and rebuild.

## 6. Explicit no-go placements

| No-go | Rationale |
|-------|-----------|
| No privileged Graph write logic in SPFx (`apps/admin`) | Browser-side code cannot safely hold elevated credentials. Violates operator-console boundary. All Graph writes go through backend adapters. |
| No durable orchestration inside `apps/admin` | Browser sessions end. Orchestration state must survive page close, network loss, and browser crashes. Server-side only. |
| No audit-persistence internals in browser code | Audit records must be tamper-resistant and durable. Writing audit data from the browser bypasses server-side validation and evidence guarantees. |
| No conversion of `@hbc/features-admin` into a catch-all control-plane package | This package is the admin intelligence layer (observation, alerting, probes). Mixing in privileged execution collapses the intelligence/execution boundary and creates a dependency mess. |
| No reusable visual admin components outside `@hbc/ui-kit` | Visual primitives that serve multiple surfaces belong in `@hbc/ui-kit`. Feature packages must not create parallel component libraries. |
| No retry or compensation logic in SPFx | Retry/compensation requires durable state and server-side policy enforcement. Browser-side retry is fragile and unauditable. |
| No direct Table Storage access from SPFx | Persistence is accessed through backend APIs. Direct Azure Table access from the browser leaks infrastructure internals and credentials. |
| No privileged SharePoint admin operations in SPFx | Site creation, hub association, ALM deployment, API approval, and permission assignment are privileged operations that require Managed Identity or elevated credentials. Browser-side execution is not acceptable. |

## 7. Boundary review checklist for future phases

Before implementing any new capability in a future phase, answer these questions:

- [ ] **Which row in the capability matrix does this feature map to?** If no row exists, add one before implementing.
- [ ] **Is the code going into the primary owner layer?** If not, justify why.
- [ ] **Does the feature require privileged credentials?** If yes, it belongs in the backend/adapters, not SPFx.
- [ ] **Does the feature need to survive a browser session ending?** If yes, it needs server-side state.
- [ ] **Does the feature produce audit records?** If yes, audit writes go through the backend.
- [ ] **Is the UI component reusable across apps?** If yes, it belongs in `@hbc/ui-kit`.
- [ ] **Does the feature add a new dependency to `@hbc/features-admin`?** If yes, verify it stays within the intelligence layer boundary.
- [ ] **Does the feature change the dependency direction of any package?** If yes, check `package-relationship-map.md`.
- [ ] **Does the feature require a new adapter?** If yes, add it under `backend/functions/src/services/` following the existing service pattern.
- [ ] **Does any no-go statement in Section 6 apply?** If yes, stop and reconsider the approach.
