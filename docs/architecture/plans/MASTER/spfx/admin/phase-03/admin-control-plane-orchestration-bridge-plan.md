# Admin Control Plane — Orchestration Bridge Plan

**Prompt:** P3-07 — Orchestration Bridge and Provisioning Generalization  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Connect the generalized admin backend to existing provisioning without destabilizing provisioning ownership.

---

## 1. Provisioning-to-generalized-run mapping

| Provisioning concept | Admin run model field | Mapping |
|---------------------|----------------------|---------|
| `correlationId` | `runId` | Direct — unique run identifier |
| `parentCorrelationId` | `parentRunId` | Direct — retry chain linkage |
| `projectId` | `targetEntityId` | Direct — domain entity reference |
| `projectName` | `targetEntityLabel` | Direct — display label |
| `overallStatus` | `status` | Mapped via `mapProvisioningStatus()` |
| `currentStep` | `currentStep` | Direct (1-based) |
| `totalSteps` | `totalSteps` | Direct (always 7 for provisioning) |
| `stepResults[]` | `steps[]` | Mapped via `mapProvisioningStepStatus()` |
| `triggeredBy` | `initiatedBy.upn` | Used as fallback actor |
| `failureClass` | `failure.failureClass` | Direct mapping |
| `lastError` | `failure.failureMessage` | Direct mapping |
| `retryCount` | `failure.retryCount` | Direct mapping |

### Status mapping

| Provisioning status | Admin run status |
|-------------------|-----------------|
| Queued, Pending | `Pending` |
| Running, InProgress | `Running` |
| Completed, Succeeded | `Completed` |
| Failed | `Failed` |
| Cancelled | `Cancelled` |
| WebPartsPending | `PartiallyDeferred` |

---

## 2. Orchestration bridge responsibilities

| Responsibility | How |
|---------------|-----|
| Translate admin invocations to provisioning context | `createProvisioningBridgeInvoker()` adapter invoker |
| Map provisioning status to admin run envelopes | `mapProvisioningToRunEnvelope()` |
| Provide dry-run support for provisioning bridge | Returns `DryRunComplete` with impact description |
| Keep provisioning-specific logic isolated | All bridge code in `orchestration-bridge.ts` |
| Delegate actual saga execution | Via existing provisioning HTTP endpoints, not cross-host service calls |

---

## 3. Retained provisioning ownership areas

These remain **exclusively** owned by provisioning and are NOT absorbed by the admin control plane:

| Area | Owner | Location |
|------|-------|----------|
| SagaOrchestrator (7-step execution) | `@hbc/provisioning` / project-setup host | `functions/provisioningSaga/` |
| Provisioning step implementations | project-setup host | `functions/provisioningSaga/steps/` |
| Provisioning state persistence | `ITableStorageService` via project-setup host | `services/table-storage-service.ts` |
| Provisioning API client | `@hbc/provisioning` | `packages/provisioning/src/api-client.ts` |
| Provisioning Zustand store | `@hbc/provisioning` | `packages/provisioning/src/store.ts` |
| SignalR provisioning progress | project-setup host | `functions/signalr/` |
| ProvisioningOversightPage | `apps/admin` | `apps/admin/src/pages/ProvisioningOversightPage.tsx` |

---

## 4. Deferred generalization work

| Work | Target | Notes |
|------|--------|-------|
| Real saga invocation through bridge | P3-07+ | Currently bridge acknowledges; real invocation stays through provisioning HTTP endpoints |
| Unified status polling (admin + provisioning) | Phase 5 | Operator console can query both admin runs and provisioning status |
| Audit evidence recording on bridge invocation | Phase 4 | Bridge produces adapter results but doesn't persist audit evidence yet |
| Migration of ProvisioningOversightPage to admin API | Phase 5 | Current page continues using `createProvisioningApiClient` unchanged |

---

## 5. Later-phase extension notes

### Adding a new admin domain adapter

1. Define adapter descriptor in `adapters.ts` with appropriate category and domains.
2. Create invoker function following the `createProvisioningBridgeInvoker()` pattern.
3. Wire invoker in `registerPhase3Adapters()` (or a later registration function).
4. The orchestrator invokes the adapter through the registry — no changes to route handlers.

### Pattern for non-provisioning bridges

Future admin domains (install/bootstrap, SharePoint control, Entra control) follow the same bridge pattern:
- Define a status snapshot interface for the domain's existing runtime
- Implement `mapXxxToRunEnvelope()` for status translation
- Create an adapter invoker for the domain's bridge adapter key
- Register with the adapter registry

---

## Cross-references

- [Phase 2 run model](../phase-02/admin-control-plane-run-model.md)
- [Phase 2 adapter registry contract](../phase-02/admin-control-plane-adapter-registry-contract.md)
- [Adapter registry and routing foundation](./admin-control-plane-adapter-registry-and-routing-foundation.md)
- [Phase 3 decision register](./admin-control-plane-phase-3-decision-register.md)
- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)

### Implementation files
- [Orchestration bridge](../../../../../backend/functions/src/services/admin-control-plane/orchestration-bridge.ts)
- [Bridge tests](../../../../../backend/functions/src/services/admin-control-plane/__tests__/orchestration-bridge.test.ts)
- [Adapter descriptors](../../../../../backend/functions/src/services/admin-control-plane/adapters.ts)
