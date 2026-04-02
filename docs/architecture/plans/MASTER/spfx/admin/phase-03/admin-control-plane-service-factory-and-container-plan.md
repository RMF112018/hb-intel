# Admin Control Plane — Service Factory and Container Plan

**Prompt:** P3-03 — Admin Service Container and Factory Foundation  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Define and implement the generalized admin control-plane service container and service-factory foundation that later routes and adapter execution depend on.

---

## 1. Service inventory

### Infrastructure services (reused from shared service layer)

| Service | Interface | Source | Purpose |
|---------|-----------|--------|---------|
| tableStorage | `ITableStorageService` | `services/table-storage-service.ts` | Azure Table Storage persistence for admin runs and audit |
| managedIdentity | `IManagedIdentityTokenService` | `services/managed-identity-token-service.ts` | Server-to-server auth for Graph/Azure calls |
| graph | `IGraphService` | `services/graph-service.ts` | Microsoft Graph API for Entra ID operations |

### Admin domain services (new in P3-03)

| Service | Interface | Purpose | Implementing prompt |
|---------|-----------|---------|-------------------|
| runService | `IAdminRunService` | Run lifecycle: launch, status, history, cancel, retry | P3-05 |
| adapterRegistry | `IAdminAdapterRegistry` | Adapter discovery, capability check, invocation routing | P3-06 |
| configService | `IAdminConfigService` | Configuration/standards resolution by scope | P3-04 |
| auditService | `IAdminAuditService` | Audit event recording and evidence linkage | P3-04 |
| preflightService | `IAdminPreflightService` | Precondition validation before run launch | P3-04 |
| actorContextResolver | `IAdminActorContextResolver` | JWT claims → `IAdminActorContext` mapping | P3-08 |

---

## 2. Eager vs lazy service guidance

All services are **eager-initialized** at factory creation time. This matches the Project-Setup host pattern where all 9 services are eager.

**Rationale:** The admin control plane has a bounded set of services (9 total). Lazy initialization adds complexity without meaningful performance benefit at this scale. If the service count grows significantly in later phases, selective lazy initialization can be introduced.

---

## 3. Excluded services and why

| Excluded service | Reason |
|-----------------|--------|
| `IProjectRequestsRepository` | Project Setup domain — owned by project-setup host |
| `IAcknowledgmentService` | Project Setup domain — owned by project-setup host |
| `ISignalRPushService` | Project Setup domain — provisioning-specific progress protocol |
| `ISharePointService` | Not needed at container level — accessed through adapters when required |
| `INotificationService` | Shared infrastructure — may be added later via adapter pattern |
| `IIdempotencyStorageService` | May be added when admin routes need write safety; not in foundation |
| Domain CRUD services | Different domain hosts — not part of admin control plane |

---

## 4. Container ownership boundaries

### Admin control plane host owns

- All services in `IAdminControlPlaneServiceContainer`
- Service interface definitions in `services/admin-control-plane/types.ts`
- Stub implementations in `services/admin-control-plane/stubs.ts`
- Factory instantiation in `hosts/admin-control-plane/service-factory.ts`

### Admin control plane host does NOT own

- Infrastructure service implementations (shared with other hosts)
- Provisioning saga internals (owned by project-setup host)
- Domain CRUD services (owned by respective domain hosts)
- Admin-intelligence layer (`@hbc/features-admin` — separate package)

### Boundary enforcement

- `IAdminControlPlaneServiceContainer` provides **compile-time enforcement** — services not in the interface are inaccessible to admin handlers.
- Host boundary tests validate structural invariants against the RELEASE-SCOPE manifest.
- Service interface definitions are co-located with stubs under `services/admin-control-plane/` to keep ownership clear.

---

## 5. Expected consumers

| Consumer | How it accesses services |
|----------|------------------------|
| Admin API route handlers (P3-04, P3-05) | Call `createAdminControlPlaneServiceFactory()` to get the container |
| Adapter registry (P3-06) | Accessed via `container.adapterRegistry` |
| Orchestration bridge (P3-07) | Accesses `container.runService`, `container.adapterRegistry`, `container.auditService` |
| Authorization wiring (P3-08) | Accesses `container.actorContextResolver` |
| Host boundary test | Validates structural invariants via source file inspection |

---

## 6. Implementation approach

### Service interface pattern

Each admin service interface:
- Is defined in `services/admin-control-plane/types.ts`
- Uses Phase 2 DTOs from `@hbc/models/admin-control-plane` as parameter/return types
- Is a single-responsibility interface (one service per concern)
- Is async-first (`Promise<T>` return types) to support future persistence backends

### Stub implementation pattern

Each stub:
- Implements the corresponding interface
- Returns plausible empty/default values
- Logs invocations for development visibility
- Does not throw (fail-safe for development) except for unimplemented operations
- Is used in both mock and real modes during Phase 3 foundation (real implementations replace stubs in later prompts)

### Factory wiring

The factory creates all admin domain services as stubs during Phase 3 foundation. As later prompts deliver real implementations, the factory will be updated to use real implementations in production mode while keeping stubs for mock/test mode.

---

## Cross-references

### Phase 3 context
- [Host and composition-root plan](./admin-control-plane-host-and-composition-root-plan.md)
- [Runtime foundation inventory](./admin-spfx-phase-3-runtime-foundation-inventory.md)
- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)

### Phase 2 contracts (service interface sources)
- [API contract catalog](../phase-02/admin-control-plane-api-contract-catalog.md)
- [Run model](../phase-02/admin-control-plane-run-model.md)
- [Adapter registry contract](../phase-02/admin-control-plane-adapter-registry-contract.md)
- [Audit, evidence, and config contracts](../phase-02/admin-control-plane-audit-evidence-and-config-contracts.md)

### Implementation files
- [Service interfaces](../../../../../backend/functions/src/services/admin-control-plane/types.ts)
- [Stub implementations](../../../../../backend/functions/src/services/admin-control-plane/stubs.ts)
- [Barrel export](../../../../../backend/functions/src/services/admin-control-plane/index.ts)
- [Service factory](../../../../../backend/functions/src/hosts/admin-control-plane/service-factory.ts)
- [RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md)
- [Host boundary test](../../../../../backend/functions/src/test/admin-control-plane-host-boundary.test.ts)
