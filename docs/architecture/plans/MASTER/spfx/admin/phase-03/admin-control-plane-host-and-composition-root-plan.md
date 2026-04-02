# Admin Control Plane — Host and Composition-Root Plan

**Prompt:** P3-02 — Admin Control Plane Host and Composition-Root Strategy  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Define and implement the backend host/composition-root strategy for the generalized admin control plane.

---

## 1. Chosen host path and rationale

### Path

```
backend/functions/src/hosts/admin-control-plane/
├── index.ts           — Composition root (selective route-family imports)
├── service-factory.ts — Scoped factory returning IAdminControlPlaneServiceContainer
├── host.json          — Azure Functions configuration (CORS, routing, timeout)
└── RELEASE-SCOPE.md   — Machine-checkable boundary specification
```

### Rationale

1. **ADR-0124 established domain-host doctrine.** The repo already supports scoped domain hosts as proven by the Project-Setup host at `backend/functions/src/hosts/project-setup/`.
2. **The monolithic host should not absorb admin control-plane routes.** Adding generalized admin API routes to the monolithic `src/index.ts` would violate the domain-host pattern and prevent independent deployment.
3. **The project-setup host must not absorb admin control-plane routes.** Project Setup owns provisioning-specific orchestration. Generalized admin endpoints (launch, status, history, retry, repair, validate, config) serve broader admin domains and must have their own boundary.
4. **Compile-time boundary enforcement.** `IAdminControlPlaneServiceContainer` prevents handlers from accessing services outside their domain, matching the `IProjectSetupServiceContainer` precedent.
5. **Independent testability.** A dedicated host-boundary test validates structural invariants against the RELEASE-SCOPE manifest.

---

## 2. Route-family scope

### Foundation (P3-02)

| Family | Purpose | Auth |
|--------|---------|------|
| health | Unauthenticated operational readiness probe | None (shared infrastructure) |

### Planned additions (later Phase 3 prompts)

| Family | Target prompt | Purpose |
|--------|--------------|---------|
| adminRuns | P3-04/P3-05 | Run launch, status, history, cancel, retry |
| adminRepair | P3-05 | Repair initiation |
| adminValidate | P3-04 | Preflight validation and preview |
| adminConfig | P3-04 | Configuration retrieval |
| adminAdapters | P3-06 | Adapter registry and execution routing |

Each addition must update:
- the composition root (`index.ts`) with the new import,
- the RELEASE-SCOPE manifest,
- and the host-boundary test.

### Excluded (permanent)

All Project Setup route families, all domain CRUD route families, and the proxy stub. See [`RELEASE-SCOPE.md`](../../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md) for the full exclusion list.

---

## 3. Service-container ownership boundary

### Foundation container (P3-02)

```typescript
interface IAdminControlPlaneServiceContainer {
  tableStorage: ITableStorageService;
  managedIdentity: IManagedIdentityTokenService;
  graph: IGraphService;
}
```

**Why these three:**
- `tableStorage` — Required for admin run persistence and audit evidence storage.
- `managedIdentity` — Required for server-to-server authentication when calling Microsoft Graph or other Azure services.
- `graph` — Required for admin actions that interact with Entra ID (user/group operations, app registrations).

### Planned expansions (later Phase 3 prompts)

As admin API routes, the adapter registry, and the orchestration bridge are added in Prompts 03–08, the container will expand. Each expansion must:
- add the new service interface to `IAdminControlPlaneServiceContainer`,
- add the Real/Mock implementation pair to the factory,
- update the RELEASE-SCOPE manifest.

### Compile-time exclusions

The typed interface prevents admin handlers from accessing:
- Project Setup services (`IProjectRequestsRepository`, `IAcknowledgmentService`, `ISignalRPushService`)
- Domain CRUD services (`ILeadService`, `IProjectService`, etc.)
- Provisioning-specific internals (saga orchestrator, provisioning-specific adapters)

---

## 4. Relationship to existing provisioning runtime

### Monolithic host (`src/index.ts`)

- **Unchanged.** Still registers all 19 route families for backward compatibility.
- The admin-control-plane host does **not** replace the monolithic host.
- Domain CRUD routes remain exclusively in the monolithic host until their own domain hosts are created.

### Project-Setup host (`src/hosts/project-setup/`)

- **Unchanged.** Still owns the 8 Project Setup route families.
- The admin-control-plane host does **not** absorb any Project-Setup routes.
- Provisioning-specific endpoints (submit, list, retry, escalation, saga execution) remain in the Project-Setup host.

### Orchestration bridge (future — P3-07)

- The admin-control-plane host will need to **invoke** provisioning execution through a generalized dispatch layer.
- This bridge will be an adapter that calls existing provisioning orchestration without moving provisioning ownership into the admin host.
- The bridge is **not** implemented in this prompt — it is deferred to P3-07.

---

## 5. Deferred route families for later phases

| Phase | Domain | Route families |
|-------|--------|---------------|
| Phase 4 | Durable evidence | Run/audit persistence endpoints |
| Phase 6 | Install/Bootstrap | Backend install verification, preflight |
| Phase 8 | SharePoint Control | Drift detection, standards, repair |
| Phase 9 | Entra Control | User/group admin, identity workflows |

These will be added to the admin-control-plane host as later phases are implemented, following the same expansion pattern: update `index.ts`, `service-factory.ts`, `RELEASE-SCOPE.md`, and the boundary test.

---

## 6. Migration and expansion notes

### Adding a new route family

1. Create the route handler under `backend/functions/src/functions/<family>/index.ts`.
2. Add `import '../../functions/<family>/index.js';` to the admin-control-plane `index.ts`.
3. Add any new services to `IAdminControlPlaneServiceContainer` and the factory.
4. Update `RELEASE-SCOPE.md` in-scope table.
5. Update the host-boundary test: add the family to `IN_SCOPE_ROUTES` and update the import count assertion.

### Adding a new service

1. Add the interface import and Real/Mock implementation imports to `service-factory.ts`.
2. Add the property to `IAdminControlPlaneServiceContainer`.
3. Add the instantiation to the `container` object in the factory function.
4. Update `RELEASE-SCOPE.md` service container section.

### Independent deployment

The admin-control-plane host is designed for eventual independent deployment as a separate Azure Function App, following the same model as the Project-Setup host. The `host.json` contains the necessary Azure Functions configuration for standalone deployment.

---

## 7. Startup config validation

The admin-control-plane host uses `validateAdminControlPlaneStartupConfig()` which validates only the core config tier (auth, table storage, adapter mode). This follows the same tiered pattern as `validateProjectSetupStartupConfig()`.

Admin-specific prerequisites (e.g., adapter configuration, domain permissions) will be validated at execution time as Phase 3 routes are added, not at startup.

---

## Cross-references

### Phase 3 context
- [Phase 3 runtime-foundation inventory](./admin-spfx-phase-3-runtime-foundation-inventory.md)
- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)

### Existing host pattern (precedent)
- [Project-Setup host composition root](../../../../../backend/functions/src/hosts/project-setup/index.ts)
- [Project-Setup service factory](../../../../../backend/functions/src/hosts/project-setup/service-factory.ts)
- [Project-Setup RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md)
- [Project-Setup host-boundary test](../../../../../backend/functions/src/test/project-setup-host-boundary.test.ts)

### New host files
- [Admin Control Plane composition root](../../../../../backend/functions/src/hosts/admin-control-plane/index.ts)
- [Admin Control Plane service factory](../../../../../backend/functions/src/hosts/admin-control-plane/service-factory.ts)
- [Admin Control Plane RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md)
- [Admin Control Plane host-boundary test](../../../../../backend/functions/src/test/admin-control-plane-host-boundary.test.ts)

### Phase 2 contracts
- [Package placement and boundary map](../phase-02/admin-control-plane-package-placement-and-boundary-map.md)

### Target architecture
- [Admin SPFx target architecture](../admin-spfx-target-architecture.md)
