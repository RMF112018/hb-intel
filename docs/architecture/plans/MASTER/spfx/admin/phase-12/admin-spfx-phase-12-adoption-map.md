# Admin SPFx IT Control Center — Phase 12 Observability Adoption Map

**Created:** 2026-04-04
**Prompt:** P12-07 — Cross-Domain Instrumentation and Correlation Adoption
**Prerequisites:** P12-04 persistence, P12-05 APIs, P12-06 runtime

---

## 1. Purpose

This document maps which admin-control-plane domains are now instrumented with observability error emission, what correlation keys each domain uses, what evidence each domain emits, and what remains future-dependent.

---

## 2. Adopted domains

### Provisioning Rollout (`AdminDomain.ProvisioningRollout`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/runs/{runId}/cancel` | cancelRun | `AdminRun` | `runId`, `admin.cancel-run` | P12-07 |
| `POST /admin/runs/{runId}/retry` | retryRun | `AdminRun` | `runId`, `admin.retry-run` | P12-07 |

**Pre-existing observability:**
- `ProvisioningAuditBridge` (P4-04): fire-and-forget audit records for saga lifecycle events (11 event types)
- `ObservabilityTelemetryBridge` (P12-05): normalizes saga failures into error records
- Structured telemetry via Application Insights custom events (35+ events)

### White-Glove Deployment (`AdminDomain.WhiteGloveDeployment`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/white-glove/runs` | launchPackageRun | `WhiteGloveDeployment` | `null`, `white-glove.launch` | P12-07 |
| `POST /admin/white-glove/runs/{runId}/cancel` | cancelPackageRun | `WhiteGloveDeployment` | `runId`, `white-glove.cancel` | P12-07 |
| `POST /admin/white-glove/runs/{runId}/retry` | retryPackageRun | `WhiteGloveDeployment` | `runId`, `white-glove.retry` | P12-07 |
| `POST /admin/white-glove/devices/{deviceRunId}/retry` | retryDeviceRun | `WhiteGloveDeployment` | `deviceRunId`, `white-glove.retry-device` | P12-07 |
| `POST /admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId}` | resolveCheckpoint | `WhiteGloveDeployment` | `null`, `white-glove.resolve-checkpoint` | P12-07 |

### Entra Control (`AdminDomain.EntraControl`)

| Route | Operation | Source | Correlation | Instrumented |
|-------|-----------|--------|-------------|-------------|
| `POST /admin/connections/{connectorId}/test` | testConnection | `EntraControl` | `null`, `connection.test` | P12-07 |
| `PATCH /admin/connections/{connectorId}/policy` | updateConnectionPolicy | `EntraControl` | `null`, `connection.update-policy` | P12-07 |

**Pre-existing observability:**
- `hybrid-identity-routes.ts`: all 7 identity routes already emit audit records via `persistIdentityAudit()` (fire-and-forget) using `AdminAuditEventType.RunCompleted`/`.RunFailed`

---

## 3. Correlation keys used

| Key | Used in | Purpose |
|-----|---------|---------|
| `domain` | All emitted records | Partition by admin domain for filtered queries |
| `runId` | Provisioning cancel/retry, white-glove cancel/retry | Links error to the specific admin run |
| `actionKey` | All emitted records | Identifies the specific operation for drilldown |
| `source` | All emitted records | Classifies the system layer that produced the error |

---

## 4. Evidence each domain emits

| Domain | Error record | Error classification | Source tag |
|--------|-------------|---------------------|-----------|
| ProvisioningRollout | On cancelRun/retryRun failure | Heuristic: structural/permissions/transient/admin-class/unclassified | `AdminRun` |
| WhiteGloveDeployment | On launch/cancel/retry/checkpoint failure | Same heuristic classification | `WhiteGloveDeployment` |
| EntraControl | On testConnection/updatePolicy failure | Same heuristic classification | `EntraControl` |

### Classification heuristics

The `emitRouteError` helper classifies errors based on message content:

| Pattern | Classification | Severity |
|---------|---------------|----------|
| Contains "not found" | `Structural` | Medium |
| Contains "permission", "unauthorized", "forbidden" | `Permissions` | High |
| Contains "timeout", "econnrefused", "network" | `Transient` | Medium |
| Contains "invalid state", "conflict" | `AdminClass` | Medium |
| No match | `Unclassified` | Medium |

---

## 5. Instrumentation pattern

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

---

## 6. What remains future-dependent

### Domains not yet instrumented (no catch blocks to instrument)

| Domain | Reason | Extension point |
|--------|--------|----------------|
| `SetupInstall` | Install orchestrator handles errors internally via run/audit stores; routes are read-only (GET) | Add `emitRouteError` if future install routes add mutation catch blocks |
| `SharePointControl` | No HTTP routes with catch blocks exist for SharePoint control actions | Add instrumentation when SharePoint control action endpoints are created |
| `StandardsConfig` | Config override routes delegate to services without try/catch | Add instrumentation when config routes gain error handling |
| `ValidationReadiness` | No validation action routes exist yet | Add instrumentation with validation endpoints |
| `RepairRecovery` | Repair routes delegate without try/catch | Add instrumentation when repair routes gain error handling |
| `AppBinding` | App binding routes delegate without try/catch | Add instrumentation when routes gain error handling |
| `HealthObservability` | Observability routes are themselves the instrumentation surface | Self-monitoring would be circular |

### Routes with zero error handling (cannot instrument)

Approximately 30 routes across all files have no try/catch blocks. These let exceptions propagate to the Azure Functions runtime. They cannot be instrumented without first adding error handling. This is a separate hardening task beyond Phase 12 observability scope.

---

## 7. Validation

- [x] functions check-types clean
- [x] functions lint 0 errors (124 pre-existing warnings)
- [x] functions build clean
- [x] functions 1864 tests passed (99 files), 9 new instrumentation tests
- [x] Existing route behavior unchanged (emitRouteError is additive, fire-and-forget)
- [x] No regression in provisioning saga or admin control flows
