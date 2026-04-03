# Admin SPFx IT Control Center — Install/Bootstrap Orchestrator

**Prompt:** P6-05 — Backend Install/Bootstrap Orchestration
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the install orchestrator's entry points, step sequencing, adapter touchpoints, and failure behavior.

---

## 1. Orchestration entry point

The install orchestrator is invoked via `executeInstallRun()`:

```typescript
executeInstallRun(deps: InstallOrchestratorDeps, actor: IAdminActorContext, commandInput: Record<string, unknown>): Promise<IAdminRunEnvelope>
```

This function:
1. Launches a run via `runService.launchRun()` with `actionKey: 'setup-install:bootstrap:full-install'`
2. Records a `RunStarted` audit event (fire-and-forget)
3. Executes the step catalog sequentially
4. Pauses at checkpoint steps (returns run in `AwaitingApproval` state)
5. Records audit events for failures and completion

The caller is responsible for resuming the orchestrator after checkpoint approval (P6-06).

---

## 2. Step sequencing

The `INSTALL_STEP_CATALOG` defines 19 steps in 3 families, executed in array order:

| # | Step ID | Family | Adapter | Checkpoint | Blocking |
|---|---------|--------|---------|-----------|----------|
| 1 | `discover-resource-group` | Discovery | `azure-deployment:bicep` | No | No |
| 2 | `discover-app-registrations` | Discovery | `entra-graph:group-lifecycle` | No | No |
| 3 | `discover-app-catalog` | Discovery | `sharepoint-alm:package-install` | No | No |
| 4 | `discover-existing-infrastructure` | Discovery | `validation-probe:readiness` | No | No |
| 5 | `deploy-resource-group` | Install | `azure-deployment:bicep` | No | Yes |
| 6 | `deploy-storage` | Install | `azure-deployment:bicep` | No | Yes |
| 7 | `deploy-function-app` | Install | `azure-deployment:bicep` | No | Yes |
| 8 | `configure-app-settings` | Install | `azure-deployment:bicep` | No | Yes |
| 9 | `create-app-registration` | Install | `entra-graph:group-lifecycle` | No | Yes |
| 10 | `grant-api-permissions` | Install | `entra-graph:group-lifecycle` | **Yes** | Yes |
| 11 | `install-spfx-package` | Install | `sharepoint-alm:package-install` | No | Yes |
| 12 | `request-sharepoint-api-access` | Install | `sharepoint-api-access:permissions` | **Yes** | Yes |
| 13 | `configure-hub-site` | Install | `sharepoint-site:lifecycle` | No | Yes |
| 14 | `verify-function-app` | Verification | `validation-probe:readiness` | No | No |
| 15 | `verify-table-storage` | Verification | `validation-probe:readiness` | No | No |
| 16 | `verify-graph-api` | Verification | `entra-graph:group-lifecycle` | No | No |
| 17 | `verify-sharepoint` | Verification | `validation-probe:readiness` | No | No |
| 18 | `verify-spfx-package` | Verification | `sharepoint-alm:package-install` | No | No |
| 19 | `verify-api-permissions` | Verification | `sharepoint-api-access:permissions` | No | No |

---

## 3. Adapter touchpoints

| Adapter key | Steps that use it | Current invoker status |
|------------|-------------------|----------------------|
| `azure-deployment:bicep` | 1, 5, 6, 7, 8 | Planned — returns `Skipped` |
| `entra-graph:group-lifecycle` | 2, 9, 10, 16 | Partial — some operations available |
| `sharepoint-alm:package-install` | 3, 11, 18 | Planned — returns `Skipped` |
| `sharepoint-api-access:permissions` | 12, 19 | Planned — returns `Skipped` |
| `validation-probe:readiness` | 4, 14, 15, 17 | Partial — readiness check available |
| `sharepoint-site:lifecycle` | 13 | Partial — hub association available |

**Note:** Planned adapters return `Skipped` via the adapter registry's default behavior. As real invokers are implemented, the orchestrator automatically picks them up without code changes — the adapter key routing is the integration point.

---

## 4. Failure behavior

| Scenario | Behavior |
|----------|----------|
| Blocking step fails | Run transitions to `Failed`; `RunFailed` audit event recorded; remaining steps skipped |
| Non-blocking step fails (discovery, verification) | Warning logged; orchestration continues to next step |
| Run cancelled between steps | Orchestrator checks `getRun()` before each step; returns immediately if `Cancelled` |
| Audit write fails | Fire-and-forget — logged to console but does not fail the run |
| Adapter returns `Skipped` | Treated as success — planned adapters do not block the flow |

---

## 5. What is automated vs checkpointed

| Automation level | Steps | Rationale |
|-----------------|-------|-----------|
| **Fully automated** | 1–4 (discovery), 5–9 (infra deploy, app settings, app registration), 11 (SPFx upload), 13 (hub site), 14–19 (verification) | These operations use managed identity credentials and do not require tenant-admin consent |
| **Manual checkpoint** | 10 (grant API permissions), 12 (request SharePoint API access) | These require tenant-admin consent in external portals (Entra admin center, SharePoint admin center) that cannot be granted by the managed identity |

---

## 6. Why this is Phase-6-appropriate

The orchestrator is intentionally scoped to install/bootstrap:

- It uses a **fixed step catalog** rather than a dynamic step-planning engine
- It delegates to the **existing adapter registry** rather than creating a parallel execution framework
- It records audit events through the **existing audit service** rather than inventing a new event bus
- It pauses at checkpoints by **returning the run envelope** rather than implementing a long-lived workflow scheduler
- It reuses the **existing run lifecycle** (`AdminRunStatus`) rather than defining install-specific status values

Future multi-domain orchestration (Phase 7+) can generalize this pattern, but Phase 6 does not build that abstraction prematurely.

---

## Implementation location

| File | Purpose |
|------|---------|
| `backend/functions/src/services/admin-control-plane/install-orchestrator.ts` | Orchestrator, step catalog, `executeInstallRun()`, `buildInitialSteps()` |
| `backend/functions/src/services/admin-control-plane/__tests__/install-orchestrator.test.ts` | Unit tests — sequencing, failure, cancellation, checkpoint, audit |

---

## Cross-references

- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities
- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — step families and definitions
- [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) — checkpoint rules
- [Preflight Validator](admin-spfx-preflight-validator.md) — pre-launch readiness checks
