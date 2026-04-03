# Admin SPFx IT Control Center — App-Binding Architecture

**Prompt:** P6A-02 — App-Binding Architecture and Resolution Model  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Define the architecture slice for first-class managed-app binding so the repo has one clear reference for what the binding record is, where it lives, who writes it, who reads it, and how it stays compatible with later Phase 10 configuration governance.

---

## 1. Purpose of the app-binding slice

Managed HB Intel SPFx apps (at minimum Accounting and Project Setup) require four runtime binding values before making backend-dependent calls:

| Field | Type | Purpose |
|-------|------|---------|
| `functionAppUrl` | `string` | Azure Function App base URL |
| `apiAudience` | `string` | API audience URI for SPFx token acquisition |
| `backendMode` | `'production' \| 'ui-review'` | Runtime mode selector |
| `allowBackendModeSwitch` | `boolean` | Enables reviewer-only mode switching |

Today these values are injected at build time via webpack DefinePlugin constants and cannot be updated without rebuilding the `.sppkg` package. The app-binding slice closes this gap by creating a durable, operator-governed source of truth for binding records that the control plane publishes, the operator console surfaces, and target apps can resolve.

---

## 2. Where the source of truth lives

### Binding authority

The **backend control plane** is the sole authority for binding records. Specifically:

- **Write authority:** Only the backend may create, update, or repair binding records.
- **Storage:** Azure Table-backed `AppBindings` table, partitioned per managed app.
- **Version tracking:** Each binding record carries a monotonically increasing version number, publication timestamp, and publishing actor.

### Binding consumers

| Consumer | Access pattern | May write? |
|----------|---------------|------------|
| Admin operator console (SPFx) | Calls admin API to read binding posture, initiate verification, trigger repair | No — reads and triggers only |
| Target SPFx apps | Primary: build-time injection via shell webpart. Future: optional runtime resolution via admin API | No — consume only |
| Install orchestrator | Publishes binding after install steps produce outputs | Yes — publish path |
| Verification service | Reads published binding and compares to live infrastructure | No — reads binding, reads live state |

---

## 3. Operator-console responsibilities

The Admin SPFx app owns the operator UX for binding. It must:

- Display per-app binding posture (status, last-published values, last-verified timestamp)
- Initiate binding verification (calls backend; does not execute verification itself)
- Initiate binding repair/re-publish (calls backend; does not write binding directly)
- Surface drift alerts when verification detects mismatches
- Display binding audit history (leverages existing audit retrieval API)

The operator console must **not**:

- Write binding records directly
- Store binding state in browser storage
- Execute privileged infrastructure checks
- Bypass verification by manually injecting binding values

---

## 4. Backend/control-plane responsibilities

The backend owns the binding lifecycle. It must:

- **Publish binding** after install/setup steps produce binding-relevant outputs (Function App URL, app registration client ID, etc.)
- **Store binding** durably in Azure Tables with per-app partitioning
- **Version binding** — each publication increments the binding version
- **Resolve binding** — expose API endpoints for binding retrieval by app ID
- **Verify binding** — compare published values to live infrastructure state and report drift
- **Repair binding** — re-publish corrected values on operator command
- **Audit binding** — record all binding lifecycle events via the existing `DurableAdminAuditStore`
- **Capture evidence** — store binding publication snapshots, verification results, and drift reports via the existing `DurableAdminEvidenceStore`

The backend must **not**:

- Automatically push binding changes to deployed `.sppkg` packages (that requires a rebuild)
- Auto-remediate drift without operator confirmation (see drift policy)
- Expose binding write endpoints to non-admin callers

---

## 5. Target-app responsibilities

Managed SPFx apps remain **binding consumers**, not binding authorities. Their responsibilities:

- **Primary resolution:** Continue using build-time injection via shell webpart `mount(config)` (unchanged)
- **Production readiness gating:** Continue using `checkProductionReadiness()` to validate that binding values are present before backend-dependent execution
- **Future resolution:** May optionally call the binding resolution API as a fallback when build-time injection is absent (not required in the minimum slice)
- **Status reporting:** May optionally report their effective binding state to the control plane for posture verification (not required in the minimum slice)

Target apps must **not**:

- Write, update, or repair binding records
- Cache binding values across sessions in a way that defeats version tracking
- Assume binding values are static — they must tolerate that values may change between `.sppkg` rebuilds

---

## 6. Why package-time injection alone is insufficient

Build-time injection via webpack DefinePlugin works for initial deployment but has structural limitations as an operator workflow:

1. **Requires `.sppkg` rebuild to change values.** If the Function App URL changes (migration, failover, reprovisioning), the operator must rebuild and redeploy all managed app packages.
2. **No operator visibility.** There is no UI for an operator to see what binding values are currently injected or whether they are still valid.
3. **No drift detection.** If infrastructure changes after deployment, build-time values become stale silently.
4. **No audit trail.** Build-time injection leaves no durable record of what was published, when, or by whom.
5. **No verification.** There is no mechanism to compare injected values to live infrastructure state.

The app-binding slice does not replace build-time injection — it creates a parallel governed source of truth that the operator can manage, verify, and repair.

---

## 7. Why the binding source must be resolvable before backend calls

Both target apps implement a `getFunctionAppUrl()` getter that throws `ConfigError` in production mode if no URL is available. The `checkProductionReadiness()` gate prevents backend-dependent rendering paths from executing without a valid URL and token provider.

If the binding slice introduces a runtime resolution path, it must complete **before** these gates execute — otherwise the app enters an error state before it has a chance to resolve binding from the control plane.

In the minimum slice, build-time injection satisfies this timing requirement. The control-plane binding store serves as the authority for verification and repair, not as the primary injection path.

---

## 8. Circular-dependency resolution

### The concern

If a target app needs `functionAppUrl` to call the backend, and the binding resolver lives on that Function App, the app cannot resolve its own binding.

### The resolution

This circular dependency does not apply in production:

1. **Build-time injection is the primary path.** Target apps receive binding at `mount()` time from shell webpart constants. No backend call is needed for initial resolution.

2. **The Admin app is the primary consumer of the binding API.** The Admin app already has its own `functionAppUrl` and can call the binding API to check posture for managed apps without any circular dependency.

3. **Verification runs server-side.** Binding verification compares published values to live infrastructure state entirely within the backend — no target-app involvement.

4. **Future runtime resolution (if added):** Could use a well-known static URL, a SharePoint property bag, or a thin CDN-backed resolver that does not depend on the Function App URL. This is deferred to later maturity.

### Architecture invariant

The binding slice must never introduce a path where a target app requires `functionAppUrl` in order to obtain `functionAppUrl`. If future prompts introduce runtime resolution for target apps, they must use an independent resolution channel.

---

## 9. Binding record model

### Per-app binding record

Each managed app has exactly one active binding record at any time:

| Field | Type | Purpose |
|-------|------|---------|
| `appId` | `string` | Canonical managed app identifier (e.g., `accounting`, `project-setup`) |
| `functionAppUrl` | `string` | Published Function App base URL |
| `apiAudience` | `string` | Published API audience URI |
| `backendMode` | `BackendMode` | Published runtime mode |
| `allowBackendModeSwitch` | `boolean` | Published mode-switch policy |
| `version` | `number` | Monotonically increasing version counter |
| `status` | `AppBindingStatus` | Current binding posture |
| `publishedAt` | `string` (ISO 8601) | When this binding version was published |
| `publishedBy` | `IAdminActorContext` | Who published this binding version |
| `publishSource` | `string` | What triggered publication (e.g., `install-run:{runId}`, `manual-repair`) |
| `lastVerifiedAt` | `string \| null` | When binding was last verified against live state |
| `lastVerificationResult` | `'passed' \| 'drifted' \| null` | Result of last verification |

### Binding status vocabulary

| Status | Meaning |
|--------|---------|
| `unbound` | No binding record exists for this app |
| `published` | Binding has been published; not yet verified |
| `verified` | Binding has been published and verified against live state |
| `drifted` | Verification detected a mismatch between published binding and live state |
| `repair-pending` | Operator has requested repair; re-publication is in progress |

### Persistence model

- **Table:** `AppBindings`
- **PartitionKey:** `appId`
- **RowKey:** `current` (active binding) or `v:{version}` (historical snapshots)
- **Serialization:** JSON fields for `publishedBy` and any complex nested values, consistent with `DurableAdminRunStore` patterns

---

## 10. API surface for binding

### New endpoints (to be implemented in Prompt 04)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/apps/{appId}/binding` | Resolve current binding for a managed app |
| `GET` | `/api/admin/apps/bindings` | List binding posture for all managed apps |
| `POST` | `/api/admin/apps/{appId}/binding/publish` | Publish or update binding for a managed app |
| `POST` | `/api/admin/apps/{appId}/binding/verify` | Trigger verification of published binding against live state |
| `POST` | `/api/admin/apps/{appId}/binding/repair` | Re-publish corrected binding values |

### Authentication and authorization

All binding endpoints require the same delegated scope and admin role as existing admin API endpoints. Target apps resolving binding (future path) may use a narrower read-only scope.

---

## 11. Phase 10 compatibility

This slice is designed to slot under later Phase 10 configuration governance without requiring it now:

| This slice provides | Phase 10 will add |
|--------------------|-------------------|
| Per-app binding records with 4 fields | Generalized per-domain configuration records with arbitrary fields |
| Dedicated `AppBindings` table | Unified configuration registry (may subsume or extend `AppBindings`) |
| Dedicated `IAppBindingService` | Generalized `IAdminConfigService` implementation (replaces stub) |
| Binding-specific audit events | Generalized configuration change audit events |
| Binding-specific API endpoints | Generalized config API that may proxy to binding service or replace it |

### Compatibility contract

Phase 10 must be able to:
- Read existing binding records from the `AppBindings` table
- Extend the binding record schema without breaking existing consumers
- Generalize the binding service interface without requiring target-app changes
- Subsume binding audit events into a broader config audit model

Phase 6A must therefore:
- Keep the binding record schema extensible (allow additional fields without breaking)
- Keep the service interface focused (publish, resolve, verify, repair)
- Not hardcode assumptions about binding being the only config concern
- Use naming and patterns consistent with the existing admin control-plane model

---

## 12. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md` | Gap audit — confirmed repo facts and gaps G1-G9 |
| `phase-6a-app-binding/admin-spfx-app-binding-resolution-lifecycle.md` | Binding lifecycle stages — companion to this architecture doc |
| `phase-6a-app-binding/admin-spfx-app-binding-repair-and-drift-policy.md` | Drift and repair policy — companion to this architecture doc |
| `admin-spfx-it-control-center-end-state-plan.md` | End-state plan — sections 6.3 and 6.8 govern binding responsibilities |
| `admin-spfx-target-architecture.md` | Target architecture — Managed App Binding / Configuration Layer |
| `phase-06/admin-spfx-install-bootstrap-architecture.md` | Phase 6 install architecture — binding publication extends this substrate |
| `phase-06/admin-spfx-install-contract-slice.md` | Phase 6 shared contracts — binding contracts follow this minimal-addition pattern |
