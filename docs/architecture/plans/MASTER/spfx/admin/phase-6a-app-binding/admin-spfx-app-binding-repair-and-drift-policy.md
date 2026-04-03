# Admin SPFx IT Control Center — App-Binding Repair and Drift Policy

**Prompt:** P6A-02 — App-Binding Architecture and Resolution Model  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Define what counts as binding drift, what can be auto-repaired vs. operator-confirmed, repair semantics, evidence expectations, and explicit anti-patterns.

---

## 1. What counts as binding drift

Binding drift occurs when the published binding record in the `AppBindings` store no longer matches the live infrastructure state. Drift is detected during verification (see resolution lifecycle, Stage 5).

### Drift categories

| Category | Condition | Example | Severity |
|----------|-----------|---------|----------|
| **Infrastructure gone** | A published value references infrastructure that no longer exists or responds | Function App deleted, app registration removed, audience URI invalid | Critical |
| **Infrastructure moved** | A published value references infrastructure that exists at a different location | Function App migrated to new URL, app registration client ID changed | Critical |
| **Value mismatch** | A published value differs from the observed live value but infrastructure is functional | Function App responds at a different URL than published, audience resolves to different app | Warning |
| **Policy mismatch** | `backendMode` or `allowBackendModeSwitch` differ from the published policy | Backend mode changed outside the binding flow | Info |
| **Stale verification** | Binding has not been verified within the expected verification window | No verification in >30 days (configurable) | Info |

### What does NOT count as drift

- Target apps using Vite env fallback values instead of shell-injected values (this is a development/test concern, not binding drift)
- Build-time constants differing from published binding (this is expected until `.sppkg` is rebuilt — it is a build currency concern, not a binding authority concern)
- The control-plane binding store being unavailable temporarily (this is an availability concern, not drift)

---

## 2. Auto-repair vs. operator-confirmed

### Minimum slice: all repairs are operator-confirmed

In the Phase 6A minimum implementation, **all repair actions require explicit operator confirmation**. There is no auto-repair.

### Rationale

- Single-admin approval is allowed (locked decision LD-08), but the operator must still see what changed and approve the correction.
- Auto-repair could mask infrastructure changes that the operator needs to understand.
- The binding values (`functionAppUrl`, `apiAudience`) are security-sensitive — changing them silently could redirect traffic to an unintended endpoint.

### Future maturity (Phase 10+)

Later phases may introduce:
- Auto-repair for policy fields (`backendMode`, `allowBackendModeSwitch`) where the correction is clearly safe
- Auto-repair triggered by install/bootstrap re-runs that produce updated values
- Scheduled verification with auto-repair for trivially correctable drift

These capabilities require stronger guardrails than the minimum slice provides and are explicitly deferred.

---

## 3. Repair semantics

### Repair workflow

1. **Operator views drift report** in the Admin binding status UX
2. **Operator reviews** the published vs. observed values and the drift severity
3. **Operator chooses repair action:**
   - **Re-publish from live state** — the binding service reads current live infrastructure values and publishes them as the new binding
   - **Re-publish with operator-specified values** — the operator provides corrected values manually
   - **Dismiss drift** — the operator acknowledges the drift but takes no action (binding status remains `drifted`)
4. **Backend executes repair:**
   - Snapshots the prior binding record as evidence
   - Publishes the corrected binding record with incremented version
   - Sets status to `published` (not `verified` — verification must run separately)
   - Records `BindingRepaired` audit event

### Repair constraints

| Constraint | Enforcement |
|-----------|-------------|
| Only authorized admins may initiate repair | Same admin role check as other admin API endpoints |
| Repair must snapshot the prior binding | Evidence capture is mandatory, not optional |
| Repair does not auto-verify | Status goes to `published`, not `verified` — operator must verify separately |
| Repair does not rebuild `.sppkg` | Changing the binding store does not change build-time constants. The operator must rebuild and redeploy `.sppkg` separately if build-time values must change. |
| Repair is idempotent | Re-publishing the same values is safe — version increments but no functional change |

---

## 4. Evidence and audit expectations

### Every binding lifecycle event must produce

| Requirement | Detail |
|------------|--------|
| **Audit event** | One `IAdminAuditRecord` per lifecycle transition, using the appropriate `AdminAuditEventType` |
| **Actor context** | Who initiated the action (`IAdminActorContext` — UPN, object ID, display name, timestamp) |
| **Evidence reference** | At least one `IAdminEvidenceReference` linking to the binding payload or verification result |

### Binding-specific audit event types

| Event type | When recorded | Required evidence |
|-----------|---------------|-------------------|
| `BindingPublished` | Binding created or updated | Full binding payload |
| `BindingVerified` | Verification completed | Verification result (per-field pass/fail, observed values) |
| `BindingDriftDetected` | Verification found drift | Drift report (expected vs. observed, severity, affected fields) |
| `BindingRepaired` | Operator-confirmed repair executed | Prior binding snapshot + new binding payload |
| `BindingRetired` | Binding decommissioned (future) | Final binding snapshot |

### Evidence retention

Binding evidence follows the same retention model as Phase 4 evidence:
- **Operational retention:** Binding publication and verification evidence retained for operational queries
- **Compliance retention:** Binding repair and drift evidence retained per compliance requirements
- Exact retention periods are governed by the Phase 4 evidence retention boundaries document

---

## 5. Explicit anti-patterns

### Do not auto-remediate in the minimum slice

**Anti-pattern:** Automatically re-publishing binding values when drift is detected.  
**Why:** Security-sensitive values (`functionAppUrl`, `apiAudience`) must not change without operator awareness. Silent redirection could mask infrastructure compromise.

### Do not treat build-time and binding-store values as interchangeable

**Anti-pattern:** Assuming that updating the binding store automatically updates the deployed `.sppkg` packages.  
**Why:** Build-time injection and binding-store publication are separate concerns. Changing the store changes the source of truth for what values *should* be. Changing the deployed package changes what values *are* injected at runtime. Both may need to happen, but they are not the same action.

### Do not verify by asking the target app

**Anti-pattern:** Verifying binding by calling the target app to report its effective config.  
**Why:** The target app may be offline, may not have the binding resolver, or may be returning cached/stale values. Verification must compare the published record to live infrastructure state, not to the target app's self-report.

### Do not cascade repair into install re-execution

**Anti-pattern:** Treating binding repair as a reason to re-run the full install orchestrator.  
**Why:** Binding repair is a narrow operation — update the binding record. Install re-execution is a heavyweight operation that may create new infrastructure. These are different actions with different risk levels.

### Do not store binding secrets in the binding record

**Anti-pattern:** Including secrets, keys, or credentials in binding field values.  
**Why:** Binding records are designed for configuration values, not secrets. The `functionAppUrl` and `apiAudience` are public-facing identifiers, not secrets. If future binding fields require sensitive values, they must use secure reference patterns (secret vault references), not inline storage.

### Do not use the binding store as a general-purpose config registry

**Anti-pattern:** Expanding the `AppBindings` table to store arbitrary configuration beyond the managed-app binding fields.  
**Why:** That is Phase 10 scope. The binding store is intentionally narrow — 4 fields per app. Broadening it prematurely creates a dependency on an immature schema.

---

## 6. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture slice — layer responsibilities, source of truth, Phase 10 compatibility |
| `phase-6a-app-binding/admin-spfx-app-binding-resolution-lifecycle.md` | Binding lifecycle — 7 stages with per-stage detail |
| `phase-6a-app-binding/admin-spfx-app-binding-gap-audit.md` | Gap audit — confirmed repo facts and identified gaps |
| `phase-04/admin-spfx-phase-4-evidence-and-retention-boundaries.md` | Evidence retention model — governs binding evidence retention |
| `phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md` | Locked decisions — LD-08 (single-admin approval) governs repair confirmation |
