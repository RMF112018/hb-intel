# Phase 9 Repo Truth and Hybrid Gap Map

## 1. Purpose

Evidence-first audit of the current repository state for **Phase 9 — Hybrid Identity Administration foundation**.

This document captures verified present truth, reusable foundations, confirmed capability limits, and the precise gap map that drives Prompts 02–11. It prevents Phase 9 implementation from guessing about backend connection state, on-prem execution patterns, or frontend readiness.

Phase 9 is governed by a **hard gate**: after the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

---

## 2. Authority set actually used

| File | Role |
|------|------|
| `CLAUDE.md` | Repository operating brief |
| `docs/architecture/blueprint/current-state-map.md` | Canonical present-state authority |
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` | Target architecture (updated for Phase 9 redirect) |
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | End-state plan with Phase 9 redirection |
| `apps/admin/package.json` | Admin app manifest — `@hbc/spfx-admin` v00.000.087 |
| `apps/admin/src/App.tsx` | App shell entry point |
| `apps/admin/src/router/routes.ts` | Route definitions with permission guards |
| `apps/admin/src/router/lane-registry.ts` | Canonical lane metadata |
| `apps/admin/src/pages/SystemSettingsPage.tsx` | Access-control settings page |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Provisioning oversight (formerly ProvisioningFailuresPage) |
| `apps/admin/src/pages/ErrorLogPage.tsx` | Scaffold — deferred to SF17-T05 |
| `apps/admin/src/pages/EntraLanePage.tsx` | Scaffold placeholder for Phase 9 |
| `packages/features/admin/README.md` | Features-admin package scope |
| `packages/features/admin/src/index.ts` | Features-admin public exports |
| `backend/functions/src/services/graph-service.ts` | Graph service implementation |
| `backend/functions/src/services/graph-service.test.ts` | Graph service tests |
| `backend/functions/src/services/service-factory.ts` | Core service factory |
| `backend/functions/src/services/table-storage-service.ts` | Table storage service |
| `backend/functions/src/services/sharepoint-service.ts` | SharePoint service |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Provisioning saga orchestrator |
| `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts` | Entra group creation in saga |
| `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | Admin control plane factory |
| `backend/functions/src/services/admin-control-plane/adapter-registry.ts` | Admin adapter registry |
| `backend/functions/src/services/admin-control-plane/admin-run-store.ts` | Admin run persistence |
| `backend/functions/src/services/admin-control-plane/types.ts` | Admin service interfaces |
| `backend/functions/src/config/entra-group-definitions.ts` | Entra group naming/membership logic |
| `backend/functions/src/utils/retry.ts` | Retry utility with exponential backoff |
| `docs/architecture/adr/ADR-0078-security-managed-identity.md` | Managed Identity auth decision |
| `docs/explanation/provisioning-architecture.md` | Provisioning architecture explanation |
| `docs/how-to/developer/operational-runbook.md` | Operational runbook |

---

## 3. Confirmed repo facts

### Admin app shell

- **Package:** `@hbc/spfx-admin` v00.000.087
- **Location:** `apps/admin/`
- **SPFx web part ID:** `cfade002-7ec3-4939-92bf-4aec3e2162e7`
- **Supported hosts:** SharePointWebPart, TeamsPersonalApp
- **Router:** TanStack Router with lazy-loaded page components
- **State management:** React hooks + Zustand (via `@hbc/shell`)
- **Data fetching:** TanStack Query + custom API clients
- **Styling:** Griffel CSS-in-JS with Fluent UI design tokens

### Current page inventory (12 pages)

| Page | Route | Status | Purpose |
|------|-------|--------|---------|
| `OperatorLandingPage.tsx` | `/` | Active | Lane grid navigation |
| `SetupWizardPage.tsx` | `/setup` | Active | Preflight checks + install launch |
| `InstallRunDetailPage.tsx` | `/setup/run/{runId}` | Active | Install run step progress |
| `BindingStatusPage.tsx` | `/setup/bindings` | Active | Binding status |
| `ValidationLanePage.tsx` | `/validation` | Scaffold | Deferred to Phase 7 |
| `ProvisioningOversightPage.tsx` | `/runs` | Active | Provisioning run management (759 lines) |
| `SharePointControlPage.tsx` | `/sharepoint` | Active | Drift detection and repair |
| `EntraLanePage.tsx` | `/entra` | **Scaffold** | **Phase 9 target** — currently shows `HbcSmartEmptyState` |
| `SystemSettingsPage.tsx` | `/config` | Active | `@hbc/auth` access-control admin |
| `OperationalDashboardPage.tsx` | `/health` | Active | Queue health, alerts, infra probes |
| `ErrorLogPage.tsx` | `/errors` | Scaffold | Deferred to SF17-T05 |
| `SharePointLanePage.tsx` | `/sharepoint` (alt) | Scaffold | SharePoint lane placeholder |

### Lane registry

The lane registry (`apps/admin/src/router/lane-registry.ts`) is the single source of truth for lane metadata. The `/entra` lane is registered as:
- **id:** `entra`
- **status:** `scaffold`
- **deliversIn:** `Phase 9`
- **scaffoldMessage:** "Entra ID app registration and permission management will be available here."
- **permission:** `ADMIN_PERMISSION`

### Route permission guards

All admin routes are gated by `requireAdminAccessControl()`. Individual actions use granular permission strings via `PermissionGate` from `@hbc/auth`.

### Dependencies

The admin app depends on: `@hbc/complexity`, `@hbc/provisioning`, `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks`, `@hbc/auth`, `@hbc/shell`, `@hbc/smart-empty-state`, `@hbc/ui-kit`, `@hbc/features-admin`.

---

## 4. Confirmed foundations Phase 9 can reuse

### Saga/orchestration pattern

`backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` implements a 7-step sequential orchestrator with:
- Step-based composition (execute + compensate phases)
- Idempotent step-completion guards (skip already-completed steps on retry)
- Durable status persistence per `projectId` + `correlationId` in Table Storage
- Retry with new `correlationId` and `parentCorrelationId` chain visibility
- Max 3 attempts per step with exponential backoff (2s, 4s, 8s)
- Transient failure detection (429, timeout, connection reset)
- Non-blocking auxiliary operations (SignalR push, audit writes)
- Failure classification via `failureClass` field

**Phase 9 reuse:** This pattern directly supports hybrid identity workflow orchestration with step-based execution, compensation, retry, and audit.

### Service factory pattern

`backend/functions/src/services/service-factory.ts` provides:
- Conditional real/mock instantiation based on `adapterMode` or `NODE_ENV`
- Eager initialization for critical services, lazy for optional
- Startup validation with degraded-mode warnings
- Singleton container return

**Phase 9 reuse:** New hybrid identity services (AD DS adapter, connection registry) will follow this pattern.

### Admin control plane

`backend/functions/src/hosts/admin-control-plane/service-factory.ts` provides:
- `IAdminRunService` — durable Table Storage backed run persistence
- `IAdminAdapterRegistry` — extensible adapter registry with descriptor + invoker pattern
- `IAdminConfigService` — stub for Phase 10
- `IAdminAuditService` — durable audit writes
- `IAdminEvidenceService` — inline/offload with retention classes
- `IAdminPreflightService` — real in prod, stub in mock
- `IAdminActorContextResolver` — actor identity for audit trails
- `IAdminAppBindingService` — app binding management

**Phase 9 reuse:** The adapter registry already has a descriptor for `identity-provisioning:ad-ds` (no invoker). The run/audit/evidence/preflight services can host hybrid identity workflows.

### Table storage pattern

`backend/functions/src/services/table-storage-service.ts` demonstrates:
- Azure Table Storage with PartitionKey/RowKey conventions
- JSON serialization for complex fields
- Replace-mode idempotent writes
- Query patterns for listing, filtering, and latest-run retrieval

**Phase 9 reuse:** Connection registry and hybrid identity run/audit records can use the same Table Storage pattern.

### Permission-gating pattern

- Frontend: `PermissionGate` component from `@hbc/auth` with granular action strings
- Backend: Environment variable gates (e.g., `GRAPH_GROUP_PERMISSION_CONFIRMED=true`)

**Phase 9 note:** The frontend permission model is ready. The backend env-var gating approach violates the no-code handoff gate and must be replaced with a UI-managed connection configuration path.

### Managed Identity auth (ADR-0078)

- All HTTP endpoints validate Entra ID Bearer tokens via `validateToken` middleware
- SharePoint and Graph calls use `DefaultAzureCredential` with user-assigned Managed Identity (`AZURE_CLIENT_ID`)
- No client secrets in production for existing services
- Timer triggers use Managed Identity only

**Phase 9 reuse:** Graph service expansion can continue using Managed Identity. AD DS connections may require a different credential model (service account, certificate) that the connection registry must manage securely.

### Retry utility

`backend/functions/src/utils/retry.ts` provides `withRetry<T>()` with exponential backoff, transient/permanent error detection, and Retry-After header support.

### Session token factory

`apps/admin/src/utils/resolveSessionToken.ts` provides fresh Bearer token per API call for frontend-to-backend communication.

### Lane registry and scaffold pattern

The lane registry supports scaffold vs active status, making it straightforward to promote `/entra` from scaffold to active when Phase 9 delivers the Hybrid Identity control lane.

---

## 5. Confirmed limits of current Entra/Graph capability

### graph-service.ts — current interface

| Method | Purpose | Limitation |
|--------|---------|------------|
| `createSecurityGroup(displayName, description)` | Create Entra security group | Provisioning-only; no user operations |
| `addGroupMembers(groupId, memberUpns[])` | Add members to group | Idempotent; 409-safe |
| `getGroupByDisplayName(displayName)` | Look up group by name | Returns ID or null |
| `deleteSecurityGroup(groupId)` | Delete group | 404-safe |
| `grantSiteAccess(siteId, appId, role?)` | Sites.Selected permission grant | SharePoint-specific |

### What graph-service.ts cannot do today

- **No user read/lookup/search** — cannot query user profiles, sync status, or account state
- **No user create/update/disable** — no lifecycle operations
- **No sync-status visibility** — cannot determine whether a user is cloud-only, AD-synced, or hybrid-joined
- **No group type awareness** — does not distinguish AD-synced groups from cloud-only groups
- **No source-of-authority routing** — treats all identity objects as cloud-side Entra objects
- **No hybrid identity error categorization** — no error types for authority conflicts or sync-pending states
- **No connection health or self-test** — relies on env-var permission gate, not runtime connection verification

### Permission model

All Graph operations are gated behind `GRAPH_GROUP_PERMISSION_CONFIRMED=true` environment variable. Operations throw `GraphPermissionNotConfirmedError` with a reference to `IT-Department-Setup-Guide.md §8.4` if the gate is not set.

This env-var gate is a **no-code handoff blocker** — it requires a deployment-time code or config edit.

---

## 6. Confirmed evidence of AD DS / on-prem / hybrid identity execution patterns

### Finding: **None exist.**

A comprehensive search across the entire codebase confirmed:
- **Zero references** to LDAP, ActiveDirectory, AD DS, or on-prem identity services
- **Zero references** to hybrid identity connectors or on-prem execution boundaries
- **No service interface** for AD DS user or group operations
- **No connection model** for on-prem directory endpoints, service accounts, or certificates

### Partial signal: adapter registry descriptor

The admin adapter registry (`backend/functions/src/services/admin-control-plane/adapter-registry.ts`) registers a descriptor for `identity-provisioning:ad-ds`, but:
- The descriptor exists as metadata only
- **No invoker function** is implemented
- Calling `invoke()` on this adapter returns a `Skipped` result

### Partial signal: entra-group-definitions.ts

`backend/functions/src/config/entra-group-definitions.ts` contains a function `resolveDepartmentViewerGroupIds()` marked as **P9-G6-03** — intended for a future replacement of UPN-based viewer membership with group ID-based lookup via a department policy. This function is currently unused and serves as a forward-looking placeholder, not a working hybrid identity pattern.

### Implication

Phase 9 must build the AD DS / on-prem identity execution boundary from scratch. There is no existing pattern to extend for on-prem directory operations. The saga/orchestration and adapter patterns provide the execution framework, but the connector implementation, connection model, and credential management are entirely missing.

---

## 7. Confirmed frontend/admin limits Phase 9 must address

### EntraLanePage is a scaffold

`apps/admin/src/pages/EntraLanePage.tsx` (57 lines) renders only:
- `WorkspacePageShell` with heading
- `HbcSmartEmptyState` with coaching callout
- A link to `/runs` for Entra group creation visibility
- Text: "Entra Control will be delivered in Phase 9"

It contains no operational functionality.

### No connection management UI

The admin app has **no pages, components, or flows** for:
- Configuring backend connections (AD DS, Graph, or any other connector)
- Testing connection health
- Rotating credentials or certificates
- Viewing connection status or last-verified timestamps

### No hybrid identity action pages

No pages exist for:
- User lifecycle administration (create, update, disable, search)
- Group and membership management with authority routing
- Rollout-critical access setup
- Cloud-side sync visibility

### No source-of-authority visibility

No UI element in the admin app indicates whether a user, group, or access action is:
- AD DS-authoritative
- Cloud-only (Entra-authoritative)
- Sync-dependent
- Authority-ambiguous

### No risk-aware workflow UX for identity

The provisioning oversight page (`ProvisioningOversightPage.tsx`) demonstrates risk-aware patterns (confirmation dialogs, complexity gating, permission guards) that can be reused, but no identity-specific risk UX exists.

### No audit/history surfaces for identity

No identity-specific audit, evidence, or history views exist. The admin audit service and evidence service exist in the backend but have no identity-specific frontend consumer.

---

## 8. Phase 9 prerequisite status

### Ready

| Prerequisite | Status |
|--------------|--------|
| Admin SPFx app shell | Ready — `@hbc/spfx-admin` is a working SPFx surface |
| TanStack Router with lazy-loading | Ready — route infrastructure supports new pages |
| Lane registry with scaffold/active model | Ready — `/entra` registered, can be promoted |
| Permission-gating system (`@hbc/auth`) | Ready — granular action-based permissions |
| Backend service factory pattern | Ready — real/mock switching, startup validation |
| Admin control plane with adapter registry | Ready — `identity-provisioning:ad-ds` descriptor exists |
| Table Storage persistence pattern | Ready — proven in provisioning and admin run stores |
| Saga/orchestration pattern | Ready — step-based, retry, compensate, audit |
| Managed Identity auth (ADR-0078) | Ready — `DefaultAzureCredential` for cloud services |
| Retry utility | Ready — exponential backoff, transient detection |
| Session token factory | Ready — fresh Bearer token per frontend API call |
| Smart empty state and UI kit components | Ready — composition primitives available |

### Not ready — must be built in Phase 9

| Prerequisite | Status |
|--------------|--------|
| AD DS / on-prem identity execution boundary | Missing entirely |
| Graph service expansion (user read, sync-status, authority routing) | Missing — only provisioning-era group ops |
| Connection registry (UI-managed, backend-stored) | Missing entirely |
| Secure backend storage for UI-entered connection details | Missing — no implementation |
| Connection health/test/rotate capability | Missing entirely |
| Hybrid identity action models and request contracts | Missing entirely |
| Source-of-authority model | Missing entirely |
| Identity-specific audit/evidence integration | Missing — audit service exists but no identity consumer |
| Hybrid Identity control lane in admin UI | Missing — scaffold only |
| Connection management UI | Missing entirely |

---

## 9. Real gaps this phase must close

### By capability domain

#### Missing frontend lane capability

| Gap | Impact |
|-----|--------|
| No Hybrid Identity control lane (only scaffold) | No operator surface for identity administration |
| No connection management pages | IT cannot configure connectors through UI |
| No user lifecycle administration pages | No user create/update/disable/search UX |
| No group/membership management pages | No group administration UX |
| No source-of-authority visibility in UI | Operators cannot see which system is authoritative |
| No sync-status visibility | Operators cannot see sync state or propagation timing |
| No identity audit/history surfaces | No evidence trail for identity actions |
| No risk-aware identity workflow UX | No confirmation/preview for destructive identity actions |

#### Missing backend control-plane capability

| Gap | Impact |
|-----|--------|
| No hybrid identity action models or request contracts | No typed interface for identity operations |
| No connection registry service | No governed storage for connector configurations |
| No connection health/test/rotate service | No runtime connection validation |
| No identity-specific preflight checks | Cannot validate identity prerequisites before action |
| No identity-specific adapter invokers | Adapter descriptors exist but cannot execute |
| Env-var permission gating violates no-code handoff | IT must edit config to enable Graph operations |

#### Missing AD DS / on-prem execution capability

| Gap | Impact |
|-----|--------|
| No AD DS service interface | Cannot perform any on-prem directory operations |
| No LDAP / AD DS connector implementation | No execution path to on-prem |
| No on-prem credential model | No secure handling of service accounts or certificates for AD DS |
| No on-prem network connectivity validation | Cannot verify reachability of AD DS endpoints |

#### Missing Graph / cloud-side capability

| Gap | Impact |
|-----|--------|
| No user read/lookup/search via Graph | Cannot query user profiles or account state |
| No sync-status queries via Graph | Cannot determine sync state of identity objects |
| No group type awareness | Cannot distinguish AD-synced from cloud-only groups |
| No cloud-side verification after on-prem actions | Cannot confirm sync propagation |

#### Missing source-of-authority modeling

| Gap | Impact |
|-----|--------|
| No source-of-authority model or matrix | Cannot route actions to correct system |
| No authority type annotations on identity objects | Cannot display authority in UI |
| No authority-aware action routing | Cannot prevent incorrect lifecycle operations |
| No sync-dependency tracking | Cannot warn operators about propagation timing |

---

## 10. Explicit non-gaps

These are working, proven capabilities that Phase 9 does **not** need to rebuild:

| Capability | Evidence |
|------------|----------|
| Provisioning saga orchestration | `saga-orchestrator.ts` — 7-step orchestrator with retry, compensate, audit |
| Admin control plane infrastructure | Run store, audit service, evidence service, preflight service, adapter registry |
| Table Storage persistence | `table-storage-service.ts` — proven pattern with partition/row key conventions |
| SPFx admin app shell | Working webpart with TanStack Router, 12 pages, 8 lanes |
| Permission model (`@hbc/auth`) | Granular action-based permission guards throughout admin app |
| Session token factory | Fresh Bearer token per API call |
| Managed Identity auth | ADR-0078 — `DefaultAzureCredential` for cloud services |
| Retry utility | Exponential backoff, transient detection, Retry-After support |
| Lane registry with scaffold model | `/entra` registered as scaffold, ready for promotion |
| Smart empty state system | Proven pattern for scaffold and coaching UX |
| UI kit component library (`@hbc/ui-kit`) | Fluent-based components available for composition |
| Features-admin intelligence package | Monitors, probes, hooks, components — reusable layer |
| Confirmation dialog and complexity gating patterns | Proven in ProvisioningOversightPage |

---

## 11. Minimal unresolved items to carry forward

### Requires Prompt-02 architecture baseline to resolve

- **AD DS connector technology choice** — LDAP direct, PowerShell remoting, hybrid agent relay, or Microsoft Identity Manager bridge. The repo has no existing pattern to constrain this choice. Prompt-02 must define the execution model before implementation.
- **Connection credential model for AD DS** — service account + password, certificate-based, or delegated. Must be decided in the architecture baseline.
- **Network topology assumptions** — whether the Azure Function can reach AD DS directly or requires an intermediary. Must be stated explicitly.

### Requires approved scope confirmation

- **Password reset / unlock scope** — the summary plan lists this as "if phase-appropriate." Prompt-03 action catalog should classify and the user should confirm.
- **Full device-join / workstation management** — explicitly listed as a non-goal in the summary plan. Confirm it remains excluded.

### No repo-truth contradictions found

No verified repo state contradicts the Phase 9 summary plan or the redirected hybrid identity thesis. The phase can proceed as designed.

---

## Validation

- All referenced file paths verified to exist in the repository.
- No speculation disguised as fact — all findings based on direct file reads and codebase searches.
- Gap map is specific enough to drive Prompts 02–11 with concrete capability boundaries.
- No repo-truth contradiction found that would require Phase 9 to stop or narrow scope.
- The current repo **cannot** let a developer hand off the `.sppkg` and walk away today for hybrid identity functionality — the companion no-code handoff gate checklist enumerates every blocker.
