# Admin SPFx IT Control Center — Phase 12 Observability Adoption Map

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-07 — re-audit against current repo truth
**Prerequisites:** P12-04 persistence, P12-05 APIs, P12-06 runtime

---

## 1. Purpose

This document maps which admin-control-plane domains are instrumented with observability error emission, what correlation keys each domain uses, what evidence each domain emits, and what remains future-dependent.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. Adopted domains

### Provisioning Rollout (`AdminDomain.ProvisioningRollout`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/runs/{runId}/cancel` | cancelRun | `AdminRun` | `runId`, `admin.cancel-run` | P12-07 |
| `POST /admin/runs/{runId}/retry` | retryRun | `AdminRun` | `runId`, `admin.retry-run` | P12-07 |

**Pre-existing observability:**
- `ProvisioningAuditBridge` (P4-04): fire-and-forget audit records for saga lifecycle events (11 event types mapped to `AdminAuditEventType` — `RunStarted`, `RunCompleted`, `RunFailed`, `RunRetried`, `RunCancelled`, `CheckpointEscalated`, `CheckpointDecided`, `ConfigModified`, and annotated step events)
- Structured telemetry via Application Insights custom events (35+ events via `withTelemetry` wrapper)
- Provisioning saga failure classification (5-class taxonomy: transient, permissions, structural, repeated, admin-class) stored on provisioning status records

**Note:** The provisioning saga classifies failures internally via `classifyFailure()` and stores `failureClass` on provisioning status records. These are visible through the run detail page and audit trail. The `ProvisioningAuditBridge` writes to `AdminAuditEvents` (the audit store), not the `ObservabilityErrors` store. The two stores serve different purposes: audit events provide a complete lifecycle trail, while observability errors provide operator-facing error visibility.

### White-Glove Deployment (`AdminDomain.WhiteGloveDeployment`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/white-glove/runs` | launchPackageRun | `WhiteGloveDeployment` | `null`, `white-glove.launch` | P12-07 |
| `POST /admin/white-glove/runs/{runId}/cancel` | cancelPackageRun | `WhiteGloveDeployment` | `runId`, `white-glove.cancel` | P12-07 |
| `POST /admin/white-glove/runs/{runId}/retry` | retryPackageRun | `WhiteGloveDeployment` | `runId`, `white-glove.retry` | P12-07 |
| `POST /admin/white-glove/devices/{deviceRunId}/retry` | retryDeviceRun | `WhiteGloveDeployment` | `deviceRunId`, `white-glove.retry-device` | P12-07 |
| `POST /admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId}` | resolveCheckpoint | `WhiteGloveDeployment` | `null`, `white-glove.resolve-checkpoint` | P12-07 |

**Pattern:** All state-changing operations are instrumented. Read-only operations (`GET`) are not instrumented (no mutation error risk).

### Entra Control (`AdminDomain.EntraControl`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/connections/{connectorId}/test` | testConnection | `EntraControl` | `null`, `connection.test` | P12-07 |
| `PATCH /admin/connections/{connectorId}/policy` | updateConnectionPolicy | `EntraControl` | `null`, `connection.update-policy` | P12-07 |

**Pre-existing observability:**
- `hybrid-identity-routes.ts`: 7 identity routes emit audit records via `persistIdentityAudit()` (fire-and-forget) writing directly to the admin audit store. This is a separate audit pathway from the observability error store.

---

## 3. Instrumentation summary

| Domain | Total routes | Instrumented | Read-only (excluded) | No try/catch (cannot instrument) |
|--------|-------------|-------------|---------------------|--------------------------------|
| Provisioning Rollout | 11 | 2 | 4 (GET) | 5 |
| White-Glove Deployment | 8 | 5 | 3 (GET) | 0 |
| Entra Control (connections) | 4 | 2 | 1 (GET) | 1 |
| **Total across adopted domains** | **23** | **9** | **8** | **6** |

**Instrumentation covers all state-changing routes that have try/catch error handling.** Routes without error handling cannot be instrumented without first adding try/catch blocks — a separate hardening task beyond Phase 12 scope.

---

## 4. Correlation keys used

| Key | Type | Used in | Purpose |
|-----|------|---------|---------|
| `domain` | `AdminDomain` enum | All emitted records | Partition by admin domain for filtered queries |
| `runId` | UUID string or `null` | Provisioning cancel/retry, white-glove cancel/retry | Links error to the specific admin run |
| `actionKey` | String | All emitted records | Identifies the specific operation for drilldown |
| `source` | `ObservabilityErrorSource` enum | All emitted records | Classifies the system layer that produced the error |

---

## 5. Evidence each domain emits

| Domain | Error record | Error classification | Source tag |
|--------|-------------|---------------------|-----------|
| ProvisioningRollout | On cancelRun/retryRun failure | Heuristic: structural/permissions/transient/admin-class/unclassified | `AdminRun` |
| WhiteGloveDeployment | On launch/cancel/retry/checkpoint failure | Same heuristic classification | `WhiteGloveDeployment` |
| EntraControl | On testConnection/updatePolicy failure | Same heuristic classification | `EntraControl` |

### Classification heuristics

The `emitRouteError` helper (`observability-emitter.ts`) classifies errors based on message content:

| Pattern | Classification | Severity |
|---------|---------------|----------|
| Contains "not found" | `Structural` | Medium |
| Contains "permission", "unauthorized", "forbidden" | `Permissions` | **High** |
| Contains "timeout", "econnrefused", "network" | `Transient` | Medium |
| Contains "invalid state", "conflict" | `AdminClass` | Medium |
| No match | `Unclassified` | Medium |

---

## 6. Instrumentation pattern

All instrumentation uses the `emitRouteError` utility (`observability-emitter.ts`):

```typescript
// In a route handler catch block:
} catch (err) {
  emitRouteError(services, {
    domain: AdminDomain.ProvisioningRollout,
    source: ObservabilityErrorSource.AdminRun,
    operation: 'cancelRun',
    runId,
    actionKey: 'admin.cancel-run',
  }, err);
  // ... existing error response logic unchanged
}
```

Properties:
- **Fire-and-forget**: errors logged via `console.warn` but never propagated
- **Non-invasive**: existing HTTP response behavior is completely unchanged
- **Uses backend observability store**: persists via `observabilityErrorStore.ingestErrors()`
- **No performance impact**: emission is async and non-blocking

---

## 7. Observability pathways

The backend has three distinct observability pathways:

| Pathway | Store | Purpose | Used by |
|---------|-------|---------|---------|
| **Observability error emission** | `ObservabilityErrors` table | Operator-facing error records for ErrorLogPage | `emitRouteError()` in 9 route catch blocks |
| **Admin audit bridge** | `AdminAuditEvents` table | Complete lifecycle audit trail for run detail/timeline | `ProvisioningAuditBridge` (11 event types), `persistIdentityAudit()` |
| **Raw telemetry** | Application Insights | Platform monitoring and debugging | `withTelemetry()` wrapper on all route handlers |

These pathways are complementary, not redundant:
- Audit events provide a complete lifecycle trail (started, step completed, failed, retried, etc.)
- Observability errors provide operator-facing error visibility for the ErrorLogPage
- Raw telemetry provides platform monitoring for DevOps

### Telemetry bridge status

The `observability-telemetry-bridge.ts` module exports `bridgeFailureToErrorStore()`, `bridgeAlertEvaluationToStore()`, and `createObservabilityBridge()`. These functions are **exported but not currently called** by any backend code. They were designed for future integration where saga-level failures would be bridged directly into the observability error store. Currently, saga failures are captured through the audit bridge pathway instead.

---

## 8. What remains future-dependent

### Domains not yet instrumented

| Domain | Reason | Extension point |
|--------|--------|----------------|
| `SetupInstall` | Install orchestrator handles errors internally via run/audit stores; routes are read-only (GET) | Add `emitRouteError` if future install routes add mutation catch blocks |
| `SharePointControl` | No HTTP routes with catch blocks exist for SharePoint control actions | Add instrumentation when SharePoint control action endpoints are created |
| `StandardsConfig` | Config override routes delegate to services without try/catch | Add instrumentation when config routes gain error handling |
| `ValidationReadiness` | No validation action routes exist yet | Add instrumentation with validation endpoints |
| `RepairRecovery` | Repair routes delegate without try/catch | Add instrumentation when repair routes gain error handling |
| `AppBinding` | App binding routes delegate without try/catch | Add instrumentation when routes gain error handling |
| `HealthObservability` | Observability routes are the instrumentation surface | Self-monitoring would create circular dependency |

### Routes with no error handling (~30 routes)

Approximately 30 routes across all route files have no try/catch blocks. These let exceptions propagate to the Azure Functions runtime. They cannot be instrumented with `emitRouteError()` without first adding error handling. This is a separate hardening task beyond Phase 12 observability scope.

### Telemetry bridge activation

The `observability-telemetry-bridge.ts` module provides functions to bridge saga-level failures directly into the observability error store. Activating this bridge would require calling `bridgeFailureToErrorStore()` from the saga orchestrator's failure path. This is an enhancement opportunity for Phase 13+ — it would make provisioning failures visible in the ErrorLogPage alongside route-level errors, providing richer operator visibility.

---

## 9. Validation

- [x] functions check-types clean
- [x] functions lint clean
- [x] functions build clean
- [x] functions 1864 tests passed (99 files), 9 instrumentation tests for P12-07
- [x] Existing route behavior unchanged (emitRouteError is additive, fire-and-forget)
- [x] No regression in provisioning saga or admin control flows
- [x] Three observability pathways documented with distinct purposes
- [x] Future-dependent domains identified with specific extension points
- [x] Telemetry bridge status documented (exported, not yet called)
