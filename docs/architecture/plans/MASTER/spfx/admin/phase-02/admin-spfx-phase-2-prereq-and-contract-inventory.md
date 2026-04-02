# Admin SPFx IT Control Center — Phase 2 Prerequisite Audit and Contract Inventory

## 1. Authority order used

1. Verified live code and configuration
2. `docs/architecture/blueprint/current-state-map.md`
3. Phase 1 admin baseline artifacts (confirmed present — see Section 2)
4. Local package/app READMEs
5. Phase 2 Summary Plan and README
6. Broader target-state architecture docs

## 2. Phase 1 prerequisite status

All Phase 1 admin baseline artifacts exist in repo and were used as input:

| Artifact | Path | Status |
|----------|------|--------|
| Repo-truth verification | `phase-01/admin-spfx-phase-1-repo-truth-verification.md` | Present |
| Architecture baseline | `phase-01/admin-spfx-phase-1-architecture-baseline.md` | Present |
| Boundary matrix | `phase-01/admin-spfx-boundary-matrix.md` | Present |
| Domain taxonomy | `phase-01/admin-spfx-domain-taxonomy.md` | Present |
| Release-scope map | `phase-01/admin-spfx-release-scope-map.md` | Present |
| Locked decisions & guards | `phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md` | Present |
| Exit reconciliation | `phase-01/admin-spfx-phase-1-exit-reconciliation.md` | Present |
| Admin docs folder README | `README.md` | Present |
| Target architecture (enriched) | `admin-spfx-target-architecture.md` | Present |

**Conclusion**: Phase 1 prerequisites are fully satisfied. Phase 2 can proceed against the canonical baseline.

## 3. Inventory of existing contract-like surfaces

### 3.1 @hbc/provisioning (v0.3.3)

**Lifecycle contracts**:

| Surface | Type | Description |
|---------|------|-------------|
| `IProjectSetupRequest` | Entity interface | Request entity with 8-state lifecycle (Submitted → Completed/Failed) |
| `IProvisioningStatus` | Entity interface | Durable saga run record — partitioned by `projectId`, keyed by `correlationId`, 7-step progress, retry chain via `parentCorrelationId` |
| `IProvisioningProgressEvent` | Event interface | SignalR broadcast payload for step state changes |
| `IProvisioningAuditRecord` | Audit interface | SharePoint ProvisioningAuditLog entry (Started/Completed/Failed) |
| `isValidTransition()` | State machine | Validates request state transitions with `STATE_TRANSITIONS` map |
| `STATE_NOTIFICATION_TARGETS` | Notification map | Per-state notification recipient configuration |

**API client contract**:

| Surface | Type | Description |
|---------|------|-------------|
| `IProvisioningApiClient` | Interface | Authenticated HTTP client — submit, list, advance state, get status, retry, escalate, archive, acknowledge, force-state, list runs |
| `createProvisioningApiClient()` | Factory | Constructs client with `(baseUrl, getToken)` |

**BIC ownership contract**:

| Surface | Type | Description |
|---------|------|-------------|
| `deriveCurrentOwner()` | Function | Resolves current responsible party by request state |
| `PROJECT_SETUP_BIC_CONFIG` | Config object | Ownership rules, action map, escalation rules |
| `createProjectSetupBicRegistration()` | Factory | BIC module registration |

**Display and classification registries**:

| Surface | Type | Description |
|---------|------|-------------|
| `PROJECT_SETUP_SUMMARY_FIELDS` | Registry | Field visibility with complexity-tier gating |
| `PROJECT_SETUP_FAILURE_MODES` | Registry | Failure mode catalog with `ProvisioningFailureClass` |
| `PROJECT_SETUP_COACHING_PROMPTS` | Registry | Contextual coaching prompts |
| `PROJECT_SETUP_INTEGRATION_RULES` | Registry | External integration rules |
| `URGENCY_INDICATOR_MAP` | Registry | BIC urgency tier → visual indicator |

**Handoff contract**:

| Surface | Type | Description |
|---------|------|-------------|
| `validateSetupHandoffReadiness()` | Validator | Pre-flight check for handoff (ADR-0077) |
| `resolveProjectHubUrl()` | Resolver | SharePoint site URL resolution |
| `IProjectHubSeedData` | Interface | Data planted into Project Hub on completion |

**Store and real-time**:

| Surface | Type | Description |
|---------|------|-------------|
| `useProvisioningStore` | Zustand store | Client-side provisioning state |
| `useProvisioningSignalR` | Hook | SignalR real-time update subscription |

### 3.2 @hbc/features-admin (v0.2.1)

**Admin-intelligence contracts**:

| Surface | Type | Description |
|---------|------|-------------|
| `IAdminAlert` | Entity interface | Alert entity with severity, category, acknowledgment state |
| `IInfrastructureProbe` / `IInfrastructureProbeResult` | Entity interfaces | Probe definition and result with health status |
| `IApprovalAuthorityRule` | Entity interface | Approval authority rule |
| `IAlertMonitor` | Interface | Monitor contract (ports-and-adapters, ADR-0106) |
| `IInfrastructureProbeDefinition` | Interface | Probe definition contract |
| `MonitorRegistry` | Class | Monitor execution engine |
| `ProbeScheduler` | Class | Probe scheduling engine |
| `AdminAlertsApi` | Class | Alert API (in-memory store, Wave 0) |
| `InfrastructureProbeApi` | Class | Probe API |
| `ApprovalAuthorityApi` | Class | Approval authority API (stub, Wave 0) |

**Boundary note**: These are admin-intelligence concerns. They do not contain control-plane execution, orchestration, or adapter logic (LD-03).

### 3.3 @hbc/models — provisioning module

**Location**: `packages/models/src/provisioning/`

| Surface | Type | Description |
|---------|------|-------------|
| `IProvisioning.ts` | Types file | Core entity interfaces (requests, saga status, audit records) |
| `IRequestClarification.ts` | Types file | Clarification request/response types |
| `IProvisioningFormData.ts` | Types file | Form input shape |
| `ProvisioningEnums.ts` | Enums file | `OverallProvisioningStatus`, `StepProvisioningStatus` |
| `constants.ts` | Constants file | `SAGA_STEPS`, `TOTAL_SAGA_STEPS` |

**No `admin-control-plane/` directory exists yet.** Phase 2 will create one.

### 3.4 backend/functions — project-setup domain host

**Domain-host pattern** (ADR-0124):

| Surface | Type | Description |
|---------|------|-------------|
| `IProjectSetupServiceContainer` | Interface | Scoped service container — 9 eager services, compile-time exclusion of domain CRUD services |
| `RELEASE-SCOPE.md` | Manifest | 8 in-scope route families, 11 explicitly excluded domain CRUD families |
| Composition root (`index.ts`) | Module | Selective route-family imports for Azure Functions v4 |
| `withAuth()` middleware | Wrapper | JWT validation + AuthContext injection |
| `parseBody()` / `parseQuery()` | Validators | Zod schema-based request validation |
| Response helpers | Functions | Standardized error/success/list response shapes with X-Request-Id |

**Saga orchestrator contract**:

| Surface | Type | Description |
|---------|------|-------------|
| `SagaOrchestrator` | Class | 7-step provisioning with retry, compensation, Step 5 deferral, dual-store audit |
| `IGraphService` | Interface | Entra group lifecycle adapter |
| `ISharePointService` | Interface | SharePoint provisioning adapter |
| `ITableStorageService` | Interface | Azure Table run persistence adapter |
| `ISignalRPushService` | Interface | Real-time progress push adapter |

### 3.5 apps/admin — operator console

| Surface | Type | Description |
|---------|------|-------------|
| Route definitions | Config | 4 routes with `admin:access-control:view` gating |
| `ProvisioningOversightPage` | Component | Full CRUD: retry, archive, escalation, force-state, complexity gating, session guards |
| Admin action permissions | Constants | `ADMIN_PROVISIONING_RETRY`, `_ARCHIVE`, `_ESCALATE`, `_FORCE_STATE`, `ADMIN_APPROVAL_MANAGE` |

## 4. Reuse / normalize / retain / missing classification

### Reusable as-is

These existing contracts can be consumed by the generalized admin control plane without modification:

| Surface | Package | Why reusable |
|---------|---------|--------------|
| `withAuth()` middleware | `backend/functions` | Generic JWT validation — domain-agnostic |
| `parseBody()` / `parseQuery()` | `backend/functions` | Generic Zod-based validation — domain-agnostic |
| Response helpers | `backend/functions` | Standardized response shapes — domain-agnostic |
| `MonitorRegistry` / `ProbeScheduler` | `@hbc/features-admin` | Admin-intelligence engines — already domain-agnostic |
| `useProvisioningSignalR` pattern | `@hbc/provisioning` | SignalR subscription pattern — generalizable to any domain |
| Domain-host composition root pattern | `backend/functions` | Per-domain Azure Functions host with scoped service container |

### Reusable with renaming or normalization

These concepts exist in provisioning-specific form and should inform generalized admin contracts:

| Provisioning concept | Generalized concept Phase 2 must define | Notes |
|---------------------|----------------------------------------|-------|
| `IProvisioningStatus` (run record) | Generalized admin run envelope | Keep provisioning-specific fields; add domain-agnostic envelope |
| `OverallProvisioningStatus` / `StepProvisioningStatus` | Generalized run lifecycle states | Phase 2 must define states that cover seamless, checkpointed, destructive, advisory modes |
| `IProvisioningProgressEvent` | Generalized progress event | Same shape, domain-agnostic naming |
| `IProvisioningAuditRecord` | Generalized audit/evidence record | Add config snapshot reference, actor context, evidence chain |
| `IProvisioningApiClient` methods | Generalized admin API contract | Abstract to domain-agnostic action verbs (initiate, status, retry, cancel, etc.) |
| `ProvisioningFailureClass` | Generalized failure classification | Same tiers, domain-agnostic naming |
| `STATE_TRANSITIONS` / `isValidTransition()` | Generalized run state machine | Phase 2 must support different transition graphs per execution mode |
| `IProjectSetupServiceContainer` | Generalized domain-host service container | Same pattern, parameterized by domain |
| `SagaOrchestrator` step model | Generalized step/action model | Abstract step interface with domain-specific step implementations |

### Provisioning-specific — retain as-is

These should stay in `@hbc/provisioning` and not be generalized:

| Surface | Why retain |
|---------|-----------|
| `IProjectSetupRequest` | Project-setup domain entity — specific lifecycle, fields, and BIC ownership |
| `PROJECT_SETUP_BIC_CONFIG` | Project-setup BIC registration — domain-specific ownership rules |
| `PROJECT_SETUP_SUMMARY_FIELDS` | Project-setup display registry — domain-specific field definitions |
| `PROJECT_SETUP_FAILURE_MODES` | Project-setup failure catalog — domain-specific failure descriptions |
| `PROJECT_SETUP_COACHING_PROMPTS` | Project-setup coaching — domain-specific operator guidance |
| `SAGA_STEPS` / `TOTAL_SAGA_STEPS` | Provisioning-specific 7-step definition |
| `validateSetupHandoffReadiness()` | Project-setup handoff validation — domain-specific |
| `IProjectHubSeedData` | Project-setup handoff data — domain-specific |
| `deriveCurrentOwner()` | Project-setup BIC ownership — domain-specific |

### Missing — must be defined in Phase 2

| Gap | What Phase 2 must produce | Notes |
|-----|--------------------------|-------|
| Admin action catalog | Enumeration of admin action domains, action types, risk levels | Must cover provisioning, Entra, SharePoint control, install/bootstrap, standards, repair |
| Execution mode contract | `seamless`, `checkpointed`, `destructive`, `advisory` mode definitions | Provisioning is seamless; other domains need different modes |
| Generalized run envelope | Domain-agnostic run record with actor, command, domain, risk, steps, evidence | Generalizes `IProvisioningStatus` without replacing it |
| Run lifecycle state machine | State transitions parameterized by execution mode | Generalizes `STATE_TRANSITIONS` for multiple modes |
| Checkpoint / approval contract | Pause point definition, approval request/response, resume semantics | Does not exist — provisioning runs straight through |
| Actor context | Operator identity, permission claims, approval authority, risk acknowledgment | Partially exists in `AuthContext` but needs formalization for audit |
| Audit/evidence contract | Generalized audit record with config snapshot, actor context, evidence chain | Generalizes `IProvisioningAuditRecord` |
| Config/standards snapshot reference | Point-in-time config version tied to run evidence | Does not exist |
| Adapter registry contract | Adapter descriptor, invocation contract, normalized result | Adapter interfaces exist but are provisioning-specific |
| API request/response DTOs | Generalized admin API contract for initiate/status/retry/cancel/checkpoint | Generalizes `IProvisioningApiClient` methods |
| Package placement map | Where each contract type lives (`@hbc/models`, provisioning, features-admin, backend) | Does not exist as a formal artifact |

## 5. Collision risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| Admin-intelligence vs control-plane bleed | `@hbc/features-admin` monitors and alerts could be confused with control-plane run monitoring | Phase 1 LD-03 locks the boundary. Phase 2 contracts must be placed in `@hbc/models`, not in `@hbc/features-admin`. |
| Provisioning lifecycle vs generalized run lifecycle | Generalized run states could break provisioning's working 8-state machine | Phase 2 must define a compatibility crosswalk, not replace `@hbc/provisioning` state ownership. |
| Domain-host container vs monolithic service factory | New admin domains could be added to the existing project-setup host instead of getting their own hosts | Phase 2 contracts must support the per-domain host pattern (ADR-0124) and document domain-host boundaries. |
| Shared types in wrong package | Control-plane types could land in `@hbc/provisioning` (too narrow) or `@hbc/features-admin` (wrong boundary) | Phase 2 must place shared pure types in `@hbc/models/src/admin-control-plane/`. |
| Premature runtime coupling | Contract types that reference runtime implementations would couple `@hbc/models` to backend internals | Phase 2 contracts must be pure interfaces/types/enums with no runtime imports. |

## 6. Explicit gaps Phase 2 must close

1. **Admin action catalog** — no canonical enumeration of admin domains and action types exists.
2. **Execution mode definitions** — seamless, checkpointed, destructive, and advisory modes are named but not formally defined.
3. **Generalized run envelope** — no domain-agnostic run record exists; only provisioning-specific `IProvisioningStatus`.
4. **Checkpoint/approval contract** — provisioning runs straight through; other domains need pause/resume semantics.
5. **Actor context formalization** — operator identity exists in `AuthContext` but is not formalized for audit/evidence traceability.
6. **Audit/evidence/config contract** — audit records are provisioning-specific; no generalized evidence or config snapshot model.
7. **Adapter registry contract** — adapter interfaces exist but are provisioning-specific; no registry or normalized result contract.
8. **API contract catalog** — admin API verbs exist in provisioning client but are not generalized.
9. **Package placement map** — no formal artifact defines where each contract type belongs.
10. **Provisioning crosswalk** — no document maps provisioning-specific types to their generalized counterparts.

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Target architecture](../admin-spfx-target-architecture.md) | 5-layer architecture diagram and layer summary |
| [Phase 1 architecture baseline](../phase-01/admin-spfx-phase-1-architecture-baseline.md) | Canonical operating model — SPFx console, backend, adapters, persistence, config governance |
| [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) | Capability-to-layer ownership rules |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | 10 locked decisions and 10 boundary guards |
| [Phase 1 domain taxonomy](../phase-01/admin-spfx-domain-taxonomy.md) | 10 admin domains with maturity labels |
| [Phase 1 release-scope map](../phase-01/admin-spfx-release-scope-map.md) | Active / advisory / expansion scope tiers |
| [`packages/provisioning/README.md`](../../../../../packages/provisioning/README.md) | Provisioning lifecycle contract and public API |
| [`packages/features/admin/README.md`](../../../../../packages/features/admin/README.md) | Admin-intelligence boundary and exports |
| [`backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md) | Domain-host pattern and scoped service container |
