# White-Glove Device Deployment — Repo-Truth Reuse Map

## Purpose

Catalog existing repo foundations against the white-glove device deployment target. Implementation must reuse and extend existing patterns before building new capabilities.

For full architectural ownership, see [white-glove-architecture-baseline.md](white-glove-architecture-baseline.md).

---

## 1. Reuse as-is

These foundations exist and should be consumed directly without modification.

### Admin shell and routing

| Foundation | Location | What it provides |
|---|---|---|
| Admin shell routing | `apps/admin/src/router/` | TanStack Router, lane registry, lazy loading, legacy redirects |
| Permission gating | `apps/admin/src/router/routes.ts` | `ADMIN_ACCESS_PERMISSION` guard on all admin routes |
| Operator landing page | `apps/admin/src/pages/OperatorLandingPage.tsx` | Landing page pattern for lane navigation |

### Admin intelligence

| Foundation | Location | What it provides |
|---|---|---|
| Alert monitors | `packages/features/admin/src/monitors/` | 7 monitor implementations + registry |
| Infrastructure probes | `packages/features/admin/src/probes/` | 7 probe implementations + scheduler |
| Admin hooks | `packages/features/admin/src/hooks/` | `useAdminAlerts`, `useInfrastructureProbes`, `useApprovalAuthority` |
| Admin APIs | `packages/features/admin/src/api/` | `AdminAlertsApi`, `ApprovalAuthorityApi`, `InfrastructureProbeApi` |
| Alert polling | `apps/admin/src/hooks/useAlertPolling.ts` | Live alert polling hook |
| Probe polling | `apps/admin/src/hooks/useProbePolling.ts` | Live probe polling hook |

### Backend infrastructure

| Foundation | Location | What it provides |
|---|---|---|
| Service factory pattern | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | 10-service eager container |
| Managed identity | `backend/functions/src/services/managed-identity-token-service.ts` | Azure managed identity token acquisition |
| Table Storage persistence | `backend/functions/src/services/table-storage-service.ts` | Azure Table Storage adapter |
| SignalR push | `backend/functions/src/services/signalr-push-service.ts` | Real-time progress notifications |
| Request middleware | `backend/functions/src/middleware/` | Request-id, validation middleware |
| Logger and telemetry | `backend/functions/src/utils/` | Structured logging and telemetry utilities |

### Provisioning patterns

| Foundation | Location | What it provides |
|---|---|---|
| Saga orchestrator pattern | `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | 7-step orchestration with run tracking, compensation, retry |
| Failure classification | `backend/functions/src/functions/provisioningSaga/classify-failure.ts` | Failure categorization and recovery guidance |
| Evidence payload builder | `backend/functions/src/functions/provisioningSaga/build-evidence-payload.ts` | Evidence manifest generation |
| Recovery guidance | `backend/functions/src/functions/provisioningSaga/recovery-guidance.ts` | Operator recovery recommendations |
| Prelaunch validation | `backend/functions/src/functions/provisioningSaga/prelaunch-validation.ts` | Pre-execution readiness checks |
| Provisioning status helpers | `apps/admin/src/utils/provisioningStatusHelpers.ts` | Status computation for SPFx display |

---

## 2. Extend

These foundations exist but need generalization or expansion for white-glove.

### Admin control plane service container

| Current state | Extension needed | Location |
|---|---|---|
| 10 eager services in `IAdminControlPlaneServiceContainer` | Add white-glove run store, audit store, connector registry, and adapter services | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` |

### Admin API routes

| Current state | Extension needed | Location |
|---|---|---|
| 4 route handlers (app-binding, connection, hybrid-identity, index) | Add white-glove package command routes, run query routes, evidence routes | `backend/functions/src/functions/adminApi/` |

### Run and audit persistence

| Current state | Extension needed | Location |
|---|---|---|
| `admin-run-store.ts` — durable run persistence | Generalize for parent/child package runs with device run children | `backend/functions/src/services/admin-control-plane/admin-run-store.ts` |
| `admin-audit-store.ts` — durable audit persistence | Add white-glove audit event types, operator action attribution | `backend/functions/src/services/admin-control-plane/admin-audit-store.ts` |
| Evidence service | Add package-run evidence manifests, child-device evidence linkage | `backend/functions/src/services/admin-control-plane/evidence-service.ts` |

### Connection registry

| Current state | Extension needed | Location |
|---|---|---|
| `connection-registry-service.ts` — connector metadata | Add Microsoft Intune/Autopilot, Apple ABM/ADE, NinjaOne connector types | `backend/functions/src/services/connection-registry-service.ts` |
| Connection routes | Add device-management connector setup, test, and health endpoints | `backend/functions/src/functions/adminApi/connection-routes.ts` |

### Graph service

| Current state | Extension needed | Location |
|---|---|---|
| `graph-service.ts` — security groups, site access, managed identity | Expand into device-management operations (Intune, Autopilot via Graph) or split into domain-specific adapter if responsibilities diverge | `backend/functions/src/services/graph-service.ts` |

### Admin features package

| Current state | Extension needed | Location |
|---|---|---|
| `@hbc/features-admin` — monitors, probes, hooks, components | Add white-glove hooks, types, connector health monitors, package run status hooks | `packages/features/admin/src/` |

---

## 3. New build required

These capabilities do not exist in the repo and must be created.

### Domain model and contracts

| Capability | Owner | Proposed location |
|---|---|---|
| Employee package template model | Shared contracts + backend | `@hbc/models` or backend contracts |
| Device platform taxonomy | Shared contracts | `@hbc/models` or backend contracts |
| Parent package run / child device run model | Backend | Backend services + shared types |
| Checkpoint taxonomy for device deployment | Backend | Backend services |
| Evidence classes for enrollment / standardization / validation | Backend | Backend services |
| Readiness rules per package type | Backend | Backend services |

### Adapter lanes

| Capability | Owner | Proposed location |
|---|---|---|
| Microsoft adapter (Intune / Autopilot / Entra device ops) | Backend | `backend/functions/src/services/device-management/microsoft/` |
| Apple adapter (ABM / ADE / MDM) | Backend | `backend/functions/src/services/device-management/apple/` |
| NinjaOne adapter (OAuth / API / bundles / scripts) | Backend | `backend/functions/src/services/device-management/ninjaone/` |

### Connector governance

| Capability | Owner | Proposed location |
|---|---|---|
| Durable connector records with versioning | Backend | Backend services |
| Secure credential handling abstraction | Backend | Backend services |
| Connector health persistence | Backend | Backend services |
| Governed connector configuration versioning | Backend + admin surfaces | Backend services + SPFx UX |

### SPFx white-glove pages

| Capability | Owner | Proposed location |
|---|---|---|
| White-glove overview page | `apps/admin` | `apps/admin/src/pages/WhiteGloveOverviewPage.tsx` |
| Connections and readiness page | `apps/admin` | `apps/admin/src/pages/WhiteGloveConnectionsPage.tsx` |
| Package launch page | `apps/admin` | `apps/admin/src/pages/WhiteGloveLaunchPage.tsx` |
| Run history page | `apps/admin` | `apps/admin/src/pages/WhiteGloveRunHistoryPage.tsx` |
| Package standards page | `apps/admin` | `apps/admin/src/pages/WhiteGlovePackageStandardsPage.tsx` |

### Package standards governance

| Capability | Owner | Proposed location |
|---|---|---|
| Template editor and version model | Backend + admin surfaces | Backend services + SPFx UX |
| Code-baseline vs governed-override model | Backend | Backend services |
| Per-role package mappings | Backend | Backend services |
| Per-platform software bundle standards | Backend | Backend services |
| Audit history for package changes | Backend | Backend services |

### Documentation

| Capability | Owner | Proposed location |
|---|---|---|
| Microsoft setup guide (Intune / Autopilot / Entra) | Docs | `docs/reference/white-glove/` or `docs/maintenance/` |
| Apple setup guide (ABM / ADE / APNs / Intune) | Docs | `docs/reference/white-glove/` or `docs/maintenance/` |
| NinjaOne setup guide (API, policies, bundles) | Docs | `docs/reference/white-glove/` or `docs/maintenance/` |
| First-use readiness workflow | Docs | `docs/how-to/developer/` |
| Troubleshooting model | Docs | `docs/reference/white-glove/` |

---

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md) — layer ownership definitions
- [Boundary matrix](white-glove-boundary-matrix.md) — operational concern ownership table
- [No-go list](white-glove-no-go-list.md) — implementation constraints
- [Gap map](../phase-09.1/admin-spfx-white-glove-gap-map.md) — detailed gap analysis (Gaps A–I)
