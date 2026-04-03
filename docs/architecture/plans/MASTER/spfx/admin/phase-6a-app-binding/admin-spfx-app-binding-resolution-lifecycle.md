# Admin SPFx IT Control Center — App-Binding Resolution Lifecycle

**Prompt:** P6A-02 — App-Binding Architecture and Resolution Model  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Define the full lifecycle for managed-app binding records from creation through retirement, with owner, inputs, outputs, audit expectations, and failure behavior for each stage.

---

## 1. Lifecycle overview

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Create   │───►│ Publish  │───►│ Resolve  │───►│  Verify  │───►│  Detect  │───►│  Repair  │───►│  Retire  │
│           │    │          │    │          │    │          │    │  Drift   │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │               │               │
  backend         backend         target app       backend         backend         backend         backend
  (install)       (binding svc)   (mount/shell)    (verify svc)   (verify svc)   (binding svc)   (binding svc)
```

Normal flow: Create → Publish → Resolve → Verify → (loop verify periodically)

Repair flow: Detect Drift → Repair → Publish → Resolve → Verify

Retirement: Retire (when app is decommissioned or binding is superseded)

---

## 2. Stage 1 — Create binding

### Definition

The initial creation of a binding record occurs when the install/bootstrap orchestrator produces values that constitute a managed app's backend configuration.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — install orchestrator |
| **Trigger** | Install step completion produces binding-relevant outputs (Step 7: `deploy-function-app` → `functionAppUrl`, Step 9: `create-app-registration` → `apiAudience` basis) |
| **Inputs** | Install step results, adapter outputs, managed app registry |
| **Outputs** | New `IAppBindingRecord` with status `published`, version 1, all 4 binding fields populated |
| **Audit** | `BindingPublished` audit event with actor, run reference, and binding payload evidence |
| **Failure behavior** | If binding creation fails, the install run records a warning but does not fail the install itself — binding publication is a post-install concern, not a blocking install step |

### Preconditions

- Install run has completed the steps that produce binding-relevant values
- The managed app ID is known (from a managed app registry or hardcoded initial set: `accounting`, `project-setup`)

---

## 3. Stage 2 — Publish binding

### Definition

Publication writes a binding record to the durable store and makes it available for resolution. Publication also occurs during repair/re-publish flows.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — binding service |
| **Trigger** | Install completion, operator-initiated repair, or operator-initiated manual publish |
| **Inputs** | `appId`, binding field values (`functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch`), actor context, publish source |
| **Outputs** | Updated `IAppBindingRecord` in `AppBindings` table with incremented version, new `publishedAt` timestamp, status set to `published` |
| **Audit** | `BindingPublished` audit event — includes full binding payload as evidence |
| **Failure behavior** | If table write fails, return error to caller. Caller (install orchestrator or operator UX) may retry. Binding status remains at prior state. |

### Idempotency

Re-publishing identical values to an already-published binding increments the version but does not create a new audit event. The `publishedAt` timestamp updates.

---

## 4. Stage 3 — Resolve binding in target app

### Definition

A target app obtains its binding values so it can make backend-dependent calls.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Target SPFx app (consumer) |
| **Trigger** | App mount/initialization |
| **Inputs** | Shell webpart config injection (primary), optional runtime resolution API call (future) |
| **Outputs** | Populated runtime config: `functionAppUrl`, `apiAudience`, `backendMode`, `allowBackendModeSwitch` stored via `setRuntimeConfig()` |
| **Audit** | None in minimum slice — target apps do not report resolution events. (Future: optional `BindingResolved` event for consumption audit.) |
| **Failure behavior** | If production mode and `functionAppUrl` is absent, `getFunctionAppUrl()` throws `ConfigError`. Project Setup falls back to `ui-review` mode with console warnings. |

### Resolution priority (unchanged from current behavior)

1. Shell webpart injection (webpack DefinePlugin constants → `mount(config)`)
2. Vite build-time env (`VITE_FUNCTION_APP_URL`, etc.)
3. Defaults (`backendMode: 'production'`, `allowBackendModeSwitch: false`)
4. Future: optional control-plane resolution API (not in minimum slice)

### Key constraint

The binding slice does **not** change the target app resolution chain in the minimum implementation. Build-time injection remains the primary path. The control-plane binding store is the authority for what values *should* be, enabling verification and repair.

---

## 5. Stage 4 — Verify binding

### Definition

Verification compares the published binding record to the live infrastructure state and reports whether the binding is still valid.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — verification service |
| **Trigger** | Operator-initiated verification from Admin UX, scheduled verification (future), or post-install verification step |
| **Inputs** | Published `IAppBindingRecord`, live infrastructure state from adapters (Function App health probe, Entra app registration lookup) |
| **Outputs** | Verification result: `passed` or `drifted` with per-field comparison details |
| **Audit** | `BindingVerified` audit event — includes verification result as evidence |
| **Failure behavior** | If live state checks fail (adapter error, timeout), verification result is `inconclusive` and binding status is not changed. Operator is notified of the verification failure. |

### Verification checks

| Check | Compares | Detection method |
|-------|----------|-----------------|
| Function App URL reachable | Published `functionAppUrl` | HTTP health probe to Function App |
| API audience valid | Published `apiAudience` | Entra app registration lookup via Graph adapter |
| Backend mode consistent | Published `backendMode` | Comparison with any backend-reported mode (if available) |

### Post-verification status update

- If all checks pass: binding status → `verified`, `lastVerifiedAt` updated
- If any check fails: binding status → `drifted`, drift details recorded

---

## 6. Stage 5 — Detect drift

### Definition

Drift occurs when the published binding values no longer match the live infrastructure state. Detection happens during verification.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — verification service |
| **Trigger** | Verification check failure |
| **Inputs** | Published binding values, observed live values |
| **Outputs** | Drift report: which fields drifted, expected vs. observed values, severity |
| **Audit** | `BindingDriftDetected` audit event — includes drift comparison as evidence |
| **Failure behavior** | Drift detection itself cannot fail if verification completed — it is the result of verification. If verification was inconclusive, drift is not declared. |

### Drift severity

| Severity | Condition | Example |
|----------|-----------|---------|
| **Critical** | `functionAppUrl` or `apiAudience` do not resolve to functional infrastructure | Function App deleted, app registration removed |
| **Warning** | Values resolve but differ from published record | Function App migrated to new URL, audience changed |
| **Info** | `backendMode` or `allowBackendModeSwitch` differ from published | Mode policy changed outside binding flow |

---

## 7. Stage 6 — Repair / reapply binding

### Definition

Repair corrects a drifted or stale binding by re-publishing updated values.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — binding service |
| **Trigger** | Operator-initiated repair from Admin UX |
| **Inputs** | `appId`, corrected binding values (operator-provided or auto-detected from live state), actor context |
| **Outputs** | Updated `IAppBindingRecord` with incremented version, status `published`, new `publishedAt` |
| **Audit** | `BindingRepaired` audit event — includes prior binding snapshot and new binding payload as evidence |
| **Failure behavior** | Same as publish — if table write fails, return error. Binding status remains `drifted` until repair succeeds. |

### Repair semantics

- Repair always increments the binding version
- Repair always records the prior binding as evidence (snapshot before repair)
- Repair resets status to `published` (not `verified` — verification must run separately)
- Repair does **not** automatically rebuild or redeploy `.sppkg` packages — that remains an operator action outside the binding slice

### Auto-repair vs. operator-confirmed

See the companion drift policy document. In the minimum slice, all repairs are operator-confirmed.

---

## 8. Stage 7 — Retire / replace binding

### Definition

Retirement marks a binding record as no longer active, typically when a managed app is decommissioned or when the binding model is superseded by Phase 10 configuration governance.

### Details

| Aspect | Value |
|--------|-------|
| **Owner layer** | Backend control plane — binding service |
| **Trigger** | Operator-initiated retirement or Phase 10 migration |
| **Inputs** | `appId`, retirement reason, actor context |
| **Outputs** | Binding record marked `retired` (new status), no longer returned by default resolution queries |
| **Audit** | `BindingRetired` audit event — includes final binding snapshot |
| **Failure behavior** | If retirement fails, binding remains active. Retirement is idempotent. |

### Minimum slice note

Retirement is defined for completeness but is **not** required in the Phase 6A minimum implementation. It becomes relevant when Phase 10 migrates binding records into a broader configuration registry.

---

## 9. Lifecycle state transitions

```text
                    ┌─────────────┐
                    │   unbound   │ (no record exists)
                    └──────┬──────┘
                           │ publish
                           v
                    ┌─────────────┐
              ┌────►│  published  │◄────────────────┐
              │     └──────┬──────┘                  │
              │            │ verify                   │
              │            v                          │
              │     ┌─────────────┐                  │
              │     │  verified   │                  │ repair
              │     └──────┬──────┘                  │
              │            │ detect drift             │
              │            v                          │
              │     ┌─────────────┐    ┌───────────┐ │
              │     │   drifted   │───►│  repair-  │─┘
              │     └─────────────┘    │  pending  │
              │                        └───────────┘
              │
              │     ┌─────────────┐
              └────►│   retired   │ (decommission / Phase 10 migration)
                    └─────────────┘
```

---

## 10. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture slice — layer responsibilities and source-of-truth model |
| `phase-6a-app-binding/admin-spfx-app-binding-repair-and-drift-policy.md` | Drift and repair policy — governs when and how repair happens |
| `phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md` | Gap audit — confirmed repo facts and identified gaps |
| `admin-spfx-it-control-center-end-state-plan.md` | End-state plan — binding lifecycle expectations |
