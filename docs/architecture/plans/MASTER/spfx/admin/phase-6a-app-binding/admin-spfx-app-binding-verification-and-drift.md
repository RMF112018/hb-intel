# Admin SPFx IT Control Center — App-Binding Verification and Drift Checks

**Prompt:** P6A-07 — App-Binding Verification and Drift Checks  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document what is verified, what counts as drift, what repair/reapply does, and how this relates to the broader Phase 6 verification pattern.

---

## 1. What is verified

The binding verification service (`binding-verification-service.ts`) executes 5 check categories against each managed app's binding record:

| # | Check | What it validates | Severity on failure |
|---|-------|-------------------|-------------------|
| 1 | **Required fields** | `functionAppUrl` and `apiAudience` are present and valid format | Critical |
| 2 | **Function App reachable** | URL has valid format with resolvable hostname | Warning (format); Critical when live probes are added |
| 3 | **API audience valid** | URI follows `api://` convention with non-trivial client ID | Warning |
| 4 | **Staleness** | Binding has been verified within 30 days | Info |
| 5 | **Status** | Binding is not Superseded or in Error state | Warning |

### Check design principles

- Each check function is **side-effect-free** — it observes the binding record and returns findings.
- Check functions do **not** modify binding state; the orchestration wrapper handles updates.
- All checks run independently — a failure in one check does not skip subsequent checks.
- Findings are classified by `severity`: critical (binding broken), warning (binding degraded), info (binding aging).

### Future infrastructure probes

Full live infrastructure probes (HTTP health checks to Function App, Graph API queries for app registration) will be added when infrastructure adapters are available. The current implementation validates structural correctness and format. The check function pattern is designed for this extension.

---

## 2. What counts as drift

Drift is defined as any finding with `critical` or `warning` severity. Findings with `info` severity (e.g., staleness) are reported but do not cause the binding to transition to `Drifted` status.

### Drift finding types

| Finding type | Field | Trigger | Severity | Repair action |
|-------------|-------|---------|----------|---------------|
| Missing binding | `binding` | No binding record exists | Critical | Publish binding |
| Empty required field | `functionAppUrl` / `apiAudience` | Field is empty string | Critical | Repair with correct value |
| Invalid URL format | `functionAppUrl` | Not a valid URL | Critical | Repair with correct URL |
| Non-standard audience | `apiAudience` | Doesn't follow `api://` convention | Warning | Verify and repair if needed |
| Short client ID | `apiAudience` | Client ID portion appears too short | Warning | Verify app registration |
| Unresolvable hostname | `functionAppUrl` | Hostname has no dots (local-only) | Warning | Repair with production URL |
| Superseded status | `status` | Binding marked as Superseded | Warning | Replace with Phase 10 config |
| Error status | `status` | Binding in error state | Warning | Repair or re-publish |
| Never verified | `staleness` | `lastVerifiedAt` is null | Info | Run verification |
| Stale verification | `staleness` | `lastVerifiedAt` > 30 days ago | Info | Re-verify |

---

## 3. What repair/reapply does

Repair is handled by the existing `repairBinding()` method on the binding store (P6A-04). The verification service produces findings that inform the operator's repair decision.

### Repair flow

1. Operator views drift findings via the Admin UX (P6A-08)
2. Operator decides which fields to correct
3. Operator submits repair request with corrected values
4. Backend updates binding: increments version, sets status to Active, clears verification metadata
5. Backend records `BindingRepaired` audit event
6. Operator triggers re-verification to confirm repair

### Repair semantics

- **Explicit override:** Operator provides corrected values for specific fields
- **Keep existing:** `null` values in the repair request keep the current field value
- **Re-publish as-is:** All fields `null` increments version without changing values (reapply)
- **No auto-detection:** Auto-resolving from live infrastructure requires adapters not yet available; deferred to later maturity

### What repair does NOT do

- Does not auto-rebuild `.sppkg` packages
- Does not auto-verify after repair (operator must trigger separately)
- Does not auto-detect correct values from Azure infrastructure
- Does not repair without operator confirmation (per drift policy)

---

## 4. Relationship to Phase 6 verification pattern

The binding verification service follows the same pattern as `install-verification-service.ts`:

| Pattern element | Phase 6 install | Phase 6A binding |
|----------------|-----------------|-------------------|
| **Individual checks** | `checkFunctionAppHealth()`, `checkTableStorageAccess()`, etc. | `checkRequiredFields()`, `checkFunctionAppReachable()`, etc. |
| **Check result** | `IAdminPostRunValidationCheck` | `IAppBindingDriftFinding` |
| **Execution wrapper** | `executeVerificationChecks()` | `executeBindingVerificationChecks()` |
| **Orchestration wrapper** | `runPostInstallVerification()` | `runAppBindingVerification()` |
| **Audit integration** | Records audit event on completion | Records `BindingVerified` or `BindingDriftDetected` |
| **Evidence capture** | Captures validation summary | Captures verification result with findings |
| **Outcome model** | Boolean `outcomeAccepted` | `AppBindingVerificationOutcome` (passed/drifted/inconclusive) |

### Key differences from install verification

- **Binding verification is per-app**, not per-run. Each managed app has its own binding and verification result.
- **Binding verification updates binding status**, not run status. The binding record transitions between Active/Drifted based on outcome.
- **Binding verification is repeatable**. It can be run multiple times without side effects beyond updating verification metadata and recording audit events.

---

## 5. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-repair-and-drift-policy.md` | Drift policy — governs when and how repair happens |
| `phase-6a-app-binding/admin-spfx-app-binding-store-and-api.md` | Binding store — persistence layer for verification state updates |
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture — verification is a control-plane responsibility |
| `phase-06/admin-spfx-post-install-verification.md` | Phase 6 verification pattern — the model this service follows |
