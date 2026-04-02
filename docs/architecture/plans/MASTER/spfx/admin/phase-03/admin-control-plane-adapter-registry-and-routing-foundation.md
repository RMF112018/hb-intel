# Admin Control Plane — Adapter Registry and Routing Foundation

**Prompt:** P3-06 — Adapter Registry and Execution Routing Foundation  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Implement the generalized adapter registry and normalized execution-routing foundation for the admin control plane backend.

---

## 1. Adapter registry model

### Registry design

The `AdminAdapterRegistry` provides a centralized registry for platform-specific adapters.

| Component | Purpose |
|-----------|---------|
| Descriptor store (`Map<string, IAdminAdapterDescriptor>`) | Stores adapter metadata for discovery and capability checking |
| Invoker store (`Map<string, AdapterInvoker>`) | Maps adapter keys to invocation functions |
| `register(descriptor, invoker?)` | Registers an adapter with optional invocation handler |
| `resolve(adapterKey)` | Exact-key lookup returning descriptor or null |
| `listAll()` | Returns all registered descriptors |
| `listForAction(actionKey)` | Filters by domain prefix extracted from action key |
| `invoke(adapterKey, context)` | Invokes the adapter's registered handler, returning normalized result |

### Invoker type

```typescript
type AdapterInvoker = (context: IAdminAdapterInvocationContext) => Promise<IAdminAdapterResult>;
```

### Invocation semantics

| Scenario | Behavior |
|----------|----------|
| Adapter registered with invoker | Calls invoker, returns its result |
| Adapter registered without invoker | Returns `Skipped` result with explanation |
| Adapter not registered | Returns `Skipped` result indicating unknown adapter |
| Invoker throws | Catches error, returns `Failed` result with issue detail |

---

## 2. Current adapter set (Phase 3)

### Active adapters (partial implementation)

| Adapter key | Category | Label | Domains | Status | Existing service |
|-------------|----------|-------|---------|--------|-----------------|
| `provisioning:bridge` | SharePointSite | Provisioning Bridge | provisioning | partial | Provisioning saga orchestrator |
| `validation-probe:readiness` | ValidationProbe | Validation Probe | provisioning, installBootstrap | partial | `@hbc/features-admin` probes |
| `entra-graph:group-lifecycle` | EntraGraph | Entra Graph — Group Lifecycle | provisioning, entraControl | partial | `GraphService` |
| `sharepoint-site:lifecycle` | SharePointSite | SharePoint Site Lifecycle | provisioning, sharepointControl | partial | `SharePointService` |

### Planned adapters (descriptor only — no invoker)

| Adapter key | Category | Label | Target phase |
|-------------|----------|-------|-------------|
| `table-storage:config-lookup` | TableStorage | Config Lookup | Phase 10 |
| `azure-deployment:bicep` | AzureDeployment | Azure Deployment (Bicep) | Phase 6 |
| `sharepoint-alm:package-install` | SharePointAlm | SharePoint ALM — Package Install | Phase 8 |
| `sharepoint-api-access:permissions` | SharePointApiAccess | SharePoint API Access | Phase 8 |
| `signalr:progress` | SignalR | SignalR Progress | Phase 3 (P3-07) |
| `notification:dispatch` | Notification | Notification Dispatch | Phase 3 (P3-07) |

---

## 3. Normalized invocation / result model

All adapters receive `IAdminAdapterInvocationContext` and return `IAdminAdapterResult`. Both types are defined in `@hbc/models/admin-control-plane` (Phase 2).

### Result outcomes

| Outcome | Meaning | Run progression |
|---------|---------|----------------|
| `Success` | Completed without issues | Continue to next step |
| `SuccessWithWarnings` | Completed with non-blocking warnings | Continue; warnings logged |
| `Failed` | Blocking error | Step fails; run may retry or compensate |
| `Skipped` | Already completed, not applicable, or no invoker | Continue |
| `DryRunComplete` | Preview analysis completed, no state changes | Return preview results |

---

## 4. Boundary notes

- Route handlers invoke adapters only through the registry (`container.adapterRegistry.invoke()`)
- Route handlers never call `GraphService`, `SharePointService`, or other platform services directly
- Adapters own platform-specific logic; the orchestrator owns sequencing and state
- Adapter descriptors are metadata — they do not carry runtime dependencies
- Invokers are optional — adapters can be registered for discovery without an invoker
- The registry is initialized during service factory startup via `registerPhase3Adapters()`

---

## 5. Deferred adapter domains

| Domain | Phase | Notes |
|--------|-------|-------|
| Install/Bootstrap (Bicep/ARM) | Phase 6 | `azure-deployment:bicep` adapter |
| SharePoint Control (ALM, API access) | Phase 8 | `sharepoint-alm:*`, `sharepoint-api-access:*` adapters |
| Broad Entra Administration | Phase 9 | Additional `entra-graph:*` adapters |
| Live Standards/Config | Phase 10 | `table-storage:config-lookup` with versioned config |

---

## Cross-references

### Phase 2 contracts
- [Adapter registry contract](../phase-02/admin-control-plane-adapter-registry-contract.md)

### Phase 3 context
- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)
- [Service factory and container plan](./admin-control-plane-service-factory-and-container-plan.md)
- [API surface and route catalog](./admin-control-plane-api-surface-and-route-catalog.md)
- [Phase 3 decision register](./admin-control-plane-phase-3-decision-register.md)

### Implementation files
- [Adapter registry](../../../../../backend/functions/src/services/admin-control-plane/adapter-registry.ts)
- [Phase 3 adapter descriptors](../../../../../backend/functions/src/services/admin-control-plane/adapters.ts)
- [Adapter registry tests](../../../../../backend/functions/src/services/admin-control-plane/__tests__/adapter-registry.test.ts)
- [Service factory](../../../../../backend/functions/src/hosts/admin-control-plane/service-factory.ts)
